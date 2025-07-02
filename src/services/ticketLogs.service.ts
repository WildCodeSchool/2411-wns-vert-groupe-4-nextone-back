import TicketLogsEntity from "@/entities/TicketLog.entity";
import BaseService from "./base.service";
import { DeepPartial } from "typeorm";
import { Status } from "@/generated/graphql";

export default class TicketLogService extends BaseService<TicketLogsEntity> {
  private static instance: TicketLogService | null = null;

  private constructor() {
    super(TicketLogsEntity);
  }

  public static getInstance(): TicketLogService {
    if (this.instance === null) {
      this.instance = new TicketLogService();
    }
    return this.instance;
  }

  public async findAllWithRelations(): Promise<TicketLogsEntity[]> {
    const ticketsWithRelation = await this.repo.find({
      relations: {
        manager: true,
        ticket: true
      }
    })
    return ticketsWithRelation
  }

 
}
