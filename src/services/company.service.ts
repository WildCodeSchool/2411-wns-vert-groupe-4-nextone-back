import CompanyEntity from "@/entities/Company.entity";
import BaseService from "./base.service";
import { GraphQLError } from "graphql/error";
import { checkStrictRole } from "@/utils/manager";


export default class CompanyService extends BaseService<CompanyEntity> {
  
  private static instance: CompanyService | null = null;

  private constructor() {
    super(CompanyEntity);
  }

  public static getService(): CompanyService {
    if (!this.instance) {
      this.instance = new CompanyService();
    }
    return this.instance;
  }

  // public async findById(id: string) {
  //   console.log("FIND COMPANY BY ID ")
  //   const company = await this.repo.find({
  //     where: {
  //       id
  //     },
  //     relations: {
  //       managers: true,
  //       services: true
  //     }
      
  //   })
  //   console.log('COMPANY : ',company)
  //   return company[0]
  // }

  public async updateCompany(companyId: string, data: Partial<CompanyEntity>, manager?: { companyId: string; role: string }) {
    if (manager && companyId !== manager.companyId) {
      throw new GraphQLError("Forbidden.");
    }
    if (manager) checkStrictRole(manager.role, "SUPER_ADMIN");
    return this.updateOne(companyId, data);
  }
}