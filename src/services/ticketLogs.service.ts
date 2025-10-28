import TicketLogsEntity from "@/entities/TicketLog.entity";
import BaseService from "./base.service";
import { FindOptionsWhere, MoreThanOrEqual } from "typeorm";
import { PaginationInput } from "@/generated/graphql";

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

  async findByPropertiesAndCount(
    fields: FindOptionsWhere<TicketLogsEntity>,
    pagination?: PaginationInput
  ): Promise<{ items: TicketLogsEntity[]; totalCount: number }> {
    
    console.log("🔍 TicketLog - fields:", fields);
    console.log("🔍 TicketLog - pagination:", pagination);
    
  
    const totalCount = await this.repo.count({ where: fields });
    
   
    const where: FindOptionsWhere<TicketLogsEntity> = { ...fields };
    
    if (pagination?.cursor) {
      where.createdAt = MoreThanOrEqual(new Date(pagination.cursor));
    }

    const items = await this.repo.find({
      where,
      order: { createdAt: pagination?.order ?? "DESC" }, 
      take: pagination?.limit ?? 20,
    });

    console.log("TicketLog - totalCount:", totalCount);
    console.log("TicketLog - items.length:", items.length);

    return { items, totalCount };
  }

  async findAllPaginated(
    pagination?: PaginationInput
  ): Promise<{ items: TicketLogsEntity[]; totalCount: number }> {
    return this.findByPropertiesAndCount({}, pagination);
  }
}
