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
      { id }: QueryCompanyArgs,
      ctx: MyContext
    ): Promise<CompanyEntity | null> => {
      if (id !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.");
      }
      const company = await companyService.findById(id);
      return company;
    },

    companyByIP: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<CompanyEntity> => {
      const clientIP =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        (ctx.req.headers["x-real-ip"] as string) ||
        ctx.req.socket?.remoteAddress ||
        ctx.req.socket?.remoteAddress;

      console.log("🔍 [companyByIP] Client IP detected:", clientIP);

      if (!clientIP) {
        throw new GraphQLError("Unable to determine client IP address");
      }

      const cleanIP = clientIP.replace(/^::ffff:/, "");
      console.log("🔍 [companyByIP] Clean IP:", cleanIP);

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
      const test: Partial<CompanyEntity> = { ...args.data };
      const newCompany = await companyService.createOne(test);
      return newCompany;
    },

    deleteCompany: async (
      _: any,
      args: MutationDeleteCompanyArgs,
      ctx: MyContext
    ): Promise<DeleteResponseCompany> => {
      if (args.id !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.");
      }
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
  "Query.companyByIP": [],
  "Mutation.createCompany": [isUserFromNextOne()],
};

export default composeResolvers(companyResolver, composition);
