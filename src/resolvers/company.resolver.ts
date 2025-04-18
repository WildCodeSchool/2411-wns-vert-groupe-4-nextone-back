<<<<<<< HEAD
import {
  DeleteResponseCompany,
  MutationCreateCompanyArgs,
  MutationDeleteCompanyArgs,
  MutationUpdateCompanyArgs,
  QueryCompanyArgs,
=======

import {
  CreateCompanyInput,
  MutationCreateOneArgs,
  MutationDeleteOneArgs,
  QueryFindByIdArgs,
>>>>>>> e7b1fda (Company entity, resolver et service, + baseService)
} from "@/generated/graphql";
import { MyContext } from "..";
import CompanyService from "@/services/company.service";
import CompanyEntity from "@/entities/Company.entity";

const companyService = CompanyService.getService();

export default {
  Query: {
<<<<<<< HEAD
    companies: async (_: any): Promise<CompanyEntity[]> => {
      const companies = await companyService.findAll();
      return companies;
    },
    company: async (
      _: any,
      { id }: QueryCompanyArgs
=======
    findAll: async (_: any): Promise<CompanyEntity[]> => {
      const companies = await companyService.findAll();
      return companies;
    },
    findById: async (
      _: any,
      { id }: QueryFindByIdArgs
>>>>>>> e7b1fda (Company entity, resolver et service, + baseService)
    ): Promise<CompanyEntity | null> => {
      const company = await companyService.findById(id);
      return company;
    },
  },
  Mutation: {
<<<<<<< HEAD
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
=======
    createOne: async (
      _: any,
      args : MutationCreateOneArgs,
      ctx: MyContext
    ): Promise<CompanyEntity> => {
      const test: Partial<CompanyEntity> = {...args.data}
      const newCompany = await companyService.createOne(test);
      return newCompany;
    },
    deleteOne: async (
      _: any,
      args : MutationDeleteOneArgs,
      ctx: MyContext
    ): Promise<boolean> => {
      const isDeleted = await companyService.deleteOne(args.id)
      return isDeleted
    }
>>>>>>> e7b1fda (Company entity, resolver et service, + baseService)
  },
};
