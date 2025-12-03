import TicketEntity from "@/entities/Ticket.entity";
import {
  PaginationInput,
  Status,
  UpdateStatusTicketInput,
} from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";
import { FindOptionsWhere, In, MoreThanOrEqual } from "typeorm";
import CompanyService from "./company.service";
import { GraphQLError } from "graphql";

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

    // ON CREE UN TICKETLOG AVEC LE NOUVEAU STATUS
    const ticketLog = new TicketLogEntity();
    ticketLog.ticket = found;
    ticketLog.manager = manager;
    ticketLog.status = status;
    await TicketLogService.getInstance().createOne(ticketLog);

    return found;
  }

  // PAGINATION TEMPS REEL
 async findByPropertiesAndCount(
    fields: FindOptionsWhere<TicketEntity>,
    pagination?: PaginationInput
  ): Promise<{ items: TicketEntity[]; totalCount: number }> {
    console.log("fields", fields);
    console.log("pagination", pagination);

    const totalCount = await this.repo.count({
      where: fields,
    });

    const where: FindOptionsWhere<TicketEntity> = { ...fields };

    if (pagination?.cursor) {
      where.createdAt = MoreThanOrEqual(new Date(pagination.cursor));
    }

    if (fields.status && Array.isArray(fields.status)) {
      where.status = In(fields.status as Status[]);
    }

    const items = await this.repo.find({
      where,
      order: { createdAt: pagination?.order ?? "ASC", id: "ASC" },
      take: pagination?.limit ?? 10,
    });

    console.log("totalCount (global):", totalCount);
    console.log("items.length:", items.length);

    return { items, totalCount };
  }

  async findAllPaginated(
    companyId: string,
    pagination?: PaginationInput
  ): Promise<{ items: TicketEntity[]; totalCount: number }> {
    return this.findByPropertiesAndCount({
      service: {
        companyId
      }
    }, pagination);
  }

  public async countAll(pagination?: PaginationInput): Promise<number> {
    const where: FindOptionsWhere<TicketEntity> = {};

    if (pagination?.cursor) {
      where.createdAt = MoreThanOrEqual(new Date(pagination.cursor));
    }
    return await this.repo.count({ where });
  }

  public async checkTicket(ticketId: string, companyId: string): Promise<void> {
    const ticket = await this.repo.findOne({
      where: {
        id: ticketId,
      },
      relations: {
        service: true,
      },
    });
    if (!ticket) {
      return
    }
    if (ticket.service.companyId !== companyId) {
      throw new GraphQLError("Forbidden.");
    }
  }
}
