import CompanyEntity from "@/entities/Company.entity";
<<<<<<< HEAD
=======
import UserEntity from "../entities/user.entity";
>>>>>>> e7b1fda (Company entity, resolver et service, + baseService)
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