import { Repository } from "typeorm";
import datasource from "../lib/datasource";
import { WhitelistedIpEntity } from "@/entities/WhitelistedIp.entity";

export default class WhitelistedIpRepository extends Repository<WhitelistedIpEntity> {
  constructor() {
    super(WhitelistedIpEntity, datasource.createEntityManager());
  }
}
