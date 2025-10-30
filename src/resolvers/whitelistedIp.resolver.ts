import WhitelistedIpService from "@/services/whitelistedIp.service";
import { MyContext } from "..";
import { WhitelistedIpEntity } from "@/entities/WhitelistedIp.entity";
import {
  MutationCreateWhitelistedIpArgs,
  MutationDeleteWhitelistedIpArgs,
  QueryWhitelistedIpArgs,
  WhitelistedIp,
  WhitelistedIpResponse,
} from "@/generated/graphql";
import { checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import CompanyService from "@/services/company.service";

const whitelistedIpService = new WhitelistedIpService();

export default {
  Query: {
    whitelistedIps: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<WhitelistedIpEntity[]> => {
      const whitelistedIps = await whitelistedIpService.getAllWhitelistedIps();
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
        data
      );
      return newWhitelistedIp;
    },

    deleteWhitelistedIp: async (
      _: any,
      { id }: MutationDeleteWhitelistedIpArgs,
      ctx: MyContext
    ): Promise<WhitelistedIpResponse> => {
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
