import {
  DeleteResponseCompany,
  MutationCreateCompanyArgs,
  MutationDeleteCompanyArgs,
  MutationUpdateCompanyArgs,
  QueryCompanyArgs,
} from "@/generated/graphql";
import { MyContext } from "..";
import CompanyService from "@/services/company.service";
import CompanyEntity from "@/entities/Company.entity";
import { checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";

const companyService = CompanyService.getService();

export default {
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
    deleteCompany: async (_: any, args: MutationDeleteCompanyArgs, ctx: MyContext): Promise<DeleteResponseCompany> => {
      const isDeleted = await companyService.deleteOne(args.id);
      return buildResponse(isDeleted, "Company deleted", "Company no deleted 😢")
    },
    updateCompany: async (_: any, args: MutationUpdateCompanyArgs, {manager}: MyContext): Promise<CompanyEntity | null> => {
      checkStrictRole(manager?.role, "SUPER_ADMIN")
      const partialCompany: Partial<CompanyEntity> = { ...args.data };
      const updatedCompany = await companyService.updateOne(
        args.data.id,
        partialCompany
      );
      return updatedCompany;
    },
  },
};
