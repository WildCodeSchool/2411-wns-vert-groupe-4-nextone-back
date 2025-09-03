import CompanyEntity from "@/entities/Company.entity";
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

}