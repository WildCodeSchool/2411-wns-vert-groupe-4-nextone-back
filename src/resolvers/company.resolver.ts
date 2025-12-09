import {
  DeleteResponseCompany,
  ManagerRole,
  MutationCreateCompanyArgs,
  MutationDeleteCompanyArgs,
  MutationUpdateCompanyArgs,
  QueryCompanyArgs,
} from "@/generated/graphql";
import { MyContext, ResolverWrapper } from "..";
import CompanyService from "@/services/company.service";
import CompanyEntity from "@/entities/Company.entity";
import { buildResponse } from "@/utils/authorization";
import ServicesService from "@/services/services.service";
import ManagerService from "@/services/manager.service";
import SettingService from "@/services/setting.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { GraphQLError } from "graphql";
import { getCleanClientIP } from "@/utils/ip.utils";
import { checkCompanyIdMatch } from "@/utils/resolvers.utils";
import WhitelistedIpService from "@/services/whitelistedIp.service";

const companyService = CompanyService.getService();
const whitelistedIpService = new WhitelistedIpService();

const companyResolver = {
  Query: {
    companies: async (_: any): Promise<CompanyEntity[]> => {
      const companies = await companyService.findAll();
      return companies;
    },

    company: async (
      _: any,
      { id }: QueryCompanyArgs
    ): Promise<CompanyEntity | null> => {
      const company = await companyService.findById(id);
      return company;
    },

    companyByIP: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<CompanyEntity> => {
      const cleanIP = getCleanClientIP(ctx.req);

      if (!cleanIP) {
        throw new GraphQLError("Unable to determine client IP address");
      }


      const whitelistedIp = await whitelistedIpService.getWhitelistedIpByIp(
        cleanIP
      );

      if (!whitelistedIp) {
        console.error("❌ [companyByIP] IP not whitelisted:", cleanIP);
        throw new GraphQLError(
          `IP address ${cleanIP} is not authorized. Please contact an administrator to register this terminal.`
        );
      }

      console.log(
        "✅ [companyByIP] IP whitelisted for company:",
        whitelistedIp.companyId
      );

      const company = await companyService.findById(whitelistedIp.companyId);

      if (!company) {
        console.error(
          "❌ [companyByIP] Company not found:",
          whitelistedIp.companyId
        );
        throw new GraphQLError("Company not found for this whitelisted IP");
      }

      console.log("✅ [companyByIP] Company found:", company.name);
      return company;
    },
  },

  Mutation: {
    createCompany: async (
      _: any,
      args: MutationCreateCompanyArgs,
      ctx: MyContext
    ): Promise<CompanyEntity> => {
      const newCompany = await companyService.createOne(args.data);
      return newCompany;
    },

    deleteCompany: async (
      _: any,
      args: MutationDeleteCompanyArgs,
      ctx: MyContext
    ): Promise<DeleteResponseCompany> => {
      const isDeleted = await companyService.deleteOne(args.id);
      return buildResponse(
        isDeleted,
        "Company deleted",
        "Company no deleted 😢"
      );
    },

    updateCompany: async (
      _: any,
      args: MutationUpdateCompanyArgs,
      { manager }: MyContext
    ): Promise<CompanyEntity | null> => {
      return companyService.updateCompany(
        args.data.id,
        { ...args.data },
        manager
          ? { companyId: manager.companyId, role: manager.role }
          : undefined
      );
    },
  },

  Company: {
    services: async ({ id }: { id: string }) => {
      return await new ServicesService().db.findOne({
        where: {
          companyId: id,
        },
      });
    },
    managers: async ({ id }: { id: string }) => {
      return await new ManagerService().db.find({
        where: {
          companyId: id,
        },
      });
    },
    settings: async ({ id }: { id: string }) => {
      return await SettingService.getService().findByProperties({
        companyId: id,
      });
    },
  },
};

const isUserFromNextOne =
  (): ResolverWrapper => (next) => (root, args, context, info) => {
    const { manager } = context;
    if (
      manager?.role !== ManagerRole.NextoneAdmin ||
      manager.companyId !== process.env.NEXTONE_COMPANY_ID
    ) {
      throw new GraphQLError("Forbidden.");
    }
    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
  "Query.company": [checkCompanyIdMatch("id")],
  "Query.companyByIP": [],
  "Mutation.createCompany": [isUserFromNextOne()],
  "Mutation.deleteCompany": [checkCompanyIdMatch("id")],
  "Mutation.updateCompany": [checkCompanyIdMatch("data.id")],
};

export default composeResolvers(companyResolver, composition);
