import WhitelistedIpService from "@/services/whitelistedIp.service";
import { MyContext, ResolverWrapper } from "..";
import { WhitelistedIpEntity } from "@/entities/WhitelistedIp.entity";
import {
  MutationCreateWhitelistedIpArgs,
  MutationDeleteWhitelistedIpArgs,
  QueryWhitelistedIpArgs,
  WhitelistedIpResponse,
} from "@/generated/graphql";
import { checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import CompanyService from "@/services/company.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { GraphQLError } from "graphql";

const whitelistedIpService = new WhitelistedIpService();

const wihteListedIpResolver = {
  Query: {
    whitelistedIps: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<WhitelistedIpEntity[]> => {
      const whitelistedIps = await whitelistedIpService.getAllWhitelistedIps(
        ctx.manager?.companyId!
      );
      return whitelistedIps;
    },

    whitelistedIp: async (
      _: any,
      { ipAddress }: QueryWhitelistedIpArgs,
      ctx: MyContext
    ): Promise<WhitelistedIpEntity | null> => {
      const whitelistedIp = await whitelistedIpService.getWhitelistedIpByIp(
        ipAddress
      );
      if (whitelistedIp && whitelistedIp.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.");
      }
      return whitelistedIp;
    },
  },

  Mutation: {
    createWhitelistedIp: async (
      _: any,
      { data }: MutationCreateWhitelistedIpArgs,
      { manager }: MyContext
    ): Promise<WhitelistedIpEntity> => {
      checkStrictRole(manager?.role, "SUPER_ADMIN");

      const newWhitelistedIp = await whitelistedIpService.createWhitelistedIp(
        data,
        manager?.companyId!
      );
      return newWhitelistedIp;
    },

    deleteWhitelistedIp: async (
      _: any,
      { id }: MutationDeleteWhitelistedIpArgs,
      ctx: MyContext
    ): Promise<WhitelistedIpResponse> => {
      console.log("ID DANS RESOLVER : ", id)
      const deleted = await whitelistedIpService.deleteWhitelistedIp(id);
      return buildResponse(
        deleted,
        "Whitelisted IP deleted successfully.",
        "Whitelisted IP not found or already deleted."
      );
    },
  },
  WhitelistedIp: {
    company: async (parent: WhitelistedIpEntity) => {
      const company = await CompanyService.getService().findById(
        parent.companyId
      );
      return company;
    },
  },
};

const isWhiteIpFromCompany =
  (): ResolverWrapper<MutationDeleteWhitelistedIpArgs> =>
  (next) =>
  async (root, args, context, info) => {
    const whiteIp = await whitelistedIpService.db.findOne({
      where: {
        id: args.id
      }
    })
    if (!whiteIp || whiteIp.companyId !== context.manager?.companyId) {
      throw new GraphQLError("Forbidden.")
    }
    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
  "Mutation.deleteWhitelistedIp": [isWhiteIpFromCompany()],
};

export default composeResolvers(wihteListedIpResolver, composition);
