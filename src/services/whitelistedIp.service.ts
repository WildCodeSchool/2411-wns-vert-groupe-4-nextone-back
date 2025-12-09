import { CreateWhitelistedIpInput } from "@/generated/graphql";
import CompanyService from "./company.service";
import WhitelistedIpRepository from "@/repositories/whitelistedIp.repository";
import { WhitelistedIpEntity } from "@/entities/WhitelistedIp.entity";
import { GraphQLError } from "graphql/error";

export default class WhitelistedIpService {
  db: WhitelistedIpRepository;

  constructor() {
    this.db = new WhitelistedIpRepository();
  }

  async getAllWhitelistedIps(companyId: string): Promise<WhitelistedIpEntity[]> {
    const whitelistedIps = await this.db.find({
      where: {
        companyId
      }
    });
    return whitelistedIps;
  }

  async getWhitelistedIpById(id: string): Promise<WhitelistedIpEntity | null> {
    return this.db.findOne({
      where: { id },
    });
  }

  async getWhitelistedIpByIp(
    ipAddress: string
  ): Promise<WhitelistedIpEntity | null> {
    return this.db.findOne({
      where: { ipAddress },
    });
  }

  async createWhitelistedIp(
    data: CreateWhitelistedIpInput
  ): Promise<WhitelistedIpEntity> {
    const company = await CompanyService.getService().findById(data.companyId);
    if (!company) {
      throw new Error(
        "No Company with this id. Impossible to create whitelisted IP."
      );
    }
    const whitelistedIp = this.db.create({ ...data, company });
    return this.db.save(whitelistedIp);
  }

  async deleteWhitelistedIp(id: string): Promise<boolean> {
    const result = await this.db.delete(id);
    return result.affected === 1;
  }

  async findOne(options: any) {
    return this.db.findOne(options);
  }

  public async checkIp(ip: string, companyId: string):Promise<void> {
    const ipEntity = await this.db.findOne({
      where: {
        ipAddress: ip
      }
    })
    if (!ipEntity) {
      return
    }
    if (ipEntity.companyId !== companyId) {
      throw new GraphQLError("Forbidden.")
    }
  }
}
