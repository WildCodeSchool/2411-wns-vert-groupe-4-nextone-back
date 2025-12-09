import CompanyEntity from "@/entities/Company.entity";
import BaseService from "./base.service";
import { GraphQLError } from "graphql/error";
import { checkStrictRole } from "@/utils/manager";
import WhitelistedIpService from "./whitelistedIp.service";

export default class CompanyService extends BaseService<CompanyEntity> {
  private static instance: CompanyService | null = null;

  private whitelistedIpService = new WhitelistedIpService();

  private constructor() {
    super(CompanyEntity);
  }

  public static getService(): CompanyService {
    if (!this.instance) {
      this.instance = new CompanyService();
    }
    return this.instance;
  }

  public async getCompanyByWhitelistedIp(
    cleanIP: string | null
  ): Promise<CompanyEntity> {
    if (!cleanIP) {
      throw new GraphQLError("Unable to determine client IP address");
    }

    const whitelistedIp = await this.whitelistedIpService.getWhitelistedIpByIp(
      cleanIP
    );

    if (!whitelistedIp) {
      throw new GraphQLError(
        `IP address ${cleanIP} is not authorized. Please contact an administrator to register this terminal.`
      );
    }

    const company = await this.findById(whitelistedIp.companyId);

    if (!company) {
      throw new GraphQLError("Company not found for this whitelisted IP");
    }

    return company;
  }

  public async updateCompany(
    companyId: string,
    data: Partial<CompanyEntity>,
    manager?: { companyId: string; role: string }
  ) {
    if (manager && companyId !== manager.companyId) {
      throw new GraphQLError("Forbidden.");
    }
    if (manager) checkStrictRole(manager.role, "SUPER_ADMIN");
    return this.updateOne(companyId, data);
  }
}
