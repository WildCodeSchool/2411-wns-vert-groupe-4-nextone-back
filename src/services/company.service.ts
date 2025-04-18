import CompanyEntity from "@/entities/Company.entity";
import UserEntity from "../entities/user.entity";
import BaseService from "./base.service";


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

}