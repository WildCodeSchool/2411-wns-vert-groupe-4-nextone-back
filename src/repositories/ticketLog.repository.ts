import datasource from "../lib/datasource";
import { Repository } from "typeorm";
import TicketLogEntity from "@/entities/TicketLog.entity";

export default class TicketLogRepository extends Repository<TicketLogEntity> {
  constructor() {
    super(TicketLogEntity, datasource.createEntityManager());
  }
}
