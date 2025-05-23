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
import { DeepPartial } from "typeorm";

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
    deleteCompany: async (
      _: any,
      args: MutationDeleteCompanyArgs,
      ctx: MyContext
    ): Promise<DeleteResponseCompany> => {
      const isDeleted = await companyService.deleteOne(args.id);
      if (isDeleted) {
        return {
          content: "Company deleted",
          success: true,
        };
      }
      return {
        content: "Company no deleted 😢",
        success: false,
      };
    },
    updateCompany: async (
      _: any,
      args: MutationUpdateCompanyArgs,
      ctx: MyContext
    ): Promise<CompanyEntity | null> => {
      const partialCompany: Partial<CompanyEntity> = { ...args.data };
      const updatedCompany = await companyService.updateOne(
        args.data.id,
        partialCompany
      );
      return updatedCompany;
    },
  },
};
