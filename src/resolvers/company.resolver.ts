import {
  DeleteResponseCompany,
  MutationCreateCompanyArgs,
  MutationDeleteCompanyArgs,
  MutationUpdateCompanyArgs,
  QueryCompanyArgs,
} from "@/generated/graphql";
import { MyContext, ResolverWrapper } from "..";
import CompanyService from "@/services/company.service";
import CompanyEntity from "@/entities/Company.entity";
import { checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import ServicesService from "@/services/services.service";
import ManagerService from "@/services/manager.service";
import SettingService from "@/services/setting.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { GraphQLError } from "graphql";

const companyService = CompanyService.getService();

const companyResolver = {
  Query: {
    companies: async (_: any): Promise<CompanyEntity[]> => {
      const companies = await companyService.findAll();
      return companies;
    },
    company: async (
      _: any,
      { id }: QueryCompanyArgs, ctx: MyContext
    ): Promise<CompanyEntity | null> => {
      if (id !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.")
      }
      const company = await companyService.findById(id);
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
        throw new GraphQLError("Forbidden.")
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
      if (args.data.id !== manager?.companyId) {
        throw new GraphQLError("Forbidden.")
      }
      checkStrictRole(manager?.role, "SUPER_ADMIN");
      const partialCompany: Partial<CompanyEntity> = { ...args.data };
      const updatedCompany = await companyService.updateOne(
        args.data.id,
        partialCompany
      );
      return updatedCompany;
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


const composition = {
  "*.*": [isAuthenticated()],

}

export default composeResolvers(companyResolver, composition)
