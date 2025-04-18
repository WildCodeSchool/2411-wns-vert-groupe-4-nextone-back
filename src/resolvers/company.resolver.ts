
import {
  CreateCompanyInput,
  MutationCreateOneArgs,
  MutationDeleteOneArgs,
  MutationUpdateCompanyArgs,
  QueryFindByIdArgs,
} from "@/generated/graphql";
import { MyContext } from "..";
import CompanyService from "@/services/company.service";
import CompanyEntity from "@/entities/Company.entity";
import { DeepPartial } from "typeorm";

const companyService = CompanyService.getService();

export default {
  Query: {
    findAll: async (_: any): Promise<CompanyEntity[]> => {
      const companies = await companyService.findAll();
      return companies;
    },
    findById: async (
      _: any,
      { id }: QueryFindByIdArgs
    ): Promise<CompanyEntity | null> => {
      const company = await companyService.findById(id);
      return company;
    },
  },
  Mutation: {
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
    },
    updateCompany: async(
      _: any,
      args : MutationUpdateCompanyArgs,
      ctx: MyContext
    ): Promise<CompanyEntity | null> => {
      const partialCompany: Partial<CompanyEntity> = { ...args.data }
      const updatedCompany = await companyService.updateOne(args.data.id, partialCompany);
      return updatedCompany
    }
  },
};
