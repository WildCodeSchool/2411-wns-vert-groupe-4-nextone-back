import TicketEntity from "@/entities/Ticket.entity";
import { PaginationInput, Status, UpdateStatusTicketInput } from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";
import { FindOptionsWhere, In, LessThan, MoreThan } from "typeorm"; 

export default class TicketService extends BaseService<TicketEntity> {
  private static instance: TicketService | null = null;

  private constructor() {
    super(TicketEntity);
  }

  public static gettInstance(): TicketService {
    if (this.instance === null) {
      this.instance = new TicketService();
    }

    return this.instance;
  }

  async updateTicketStatus(
    { id, status }: UpdateStatusTicketInput,
    manager: ManagerEntity
  ): Promise<TicketEntity> {
    const found = await this.findById(id);

    if (!found) {
      throw new Error("No ticket with this id.");
    }
    found.status = status;
    this.repo.save(found);

    //ON CREE UN TICKETLOG AVEC LE NOUVEAU STATUS
    const ticketLog = new TicketLogEntity();
    ticketLog.ticket = found;
    ticketLog.manager = manager;
    ticketLog.status = status;
    await TicketLogService.getInstance().createOne(ticketLog);

    return found;
  }

  async findByPropertiesAndCount(
    fields: FindOptionsWhere<TicketEntity>,
    pagination?: PaginationInput
  ): Promise<{ items: TicketEntity[]; totalCount: number }> { 
    const where: FindOptionsWhere<TicketEntity> = { ...fields };
    console.log("fields", fields);
    // console.log("where", where);
    console.log("pagination", pagination); 
    if (pagination?.cursor) {
      where.createdAt = MoreThan(new Date(pagination.cursor));
      // where.createdAt = LessThan(new Date(pagination.cursor)); 
    }

     if (fields.status && Array.isArray(fields.status)) {
    where.status = In(fields.status as Status[]);
    }

    const [items, totalCount] = await this.repo.findAndCount({
      where,
      order: { createdAt: pagination?.order ?? "DESC" }, 
      take: pagination?.limit ?? 10,
    });

    return { items, totalCount };
  }

  public async countAll(pagination?: PaginationInput): Promise<number> {
    const where: FindOptionsWhere<TicketEntity> = {};
    if (pagination?.cursor) {
      // where.createdAt = LessThan(new Date(pagination.cursor)); 
      where.createdAt = MoreThan(new Date(pagination.cursor));
    }
    return await this.repo.count({ where });
  }
}
