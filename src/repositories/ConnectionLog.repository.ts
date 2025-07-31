import datasource from "@/lib/datasource";
import { Repository } from "typeorm";
import ConnectionLogEntity from "@/entities/ConnectionLog.entity";

export default class ConnectionLogRepository extends Repository<ConnectionLogEntity> {
  constructor() {
    super(ConnectionLogEntity, datasource.createEntityManager());
  }
}