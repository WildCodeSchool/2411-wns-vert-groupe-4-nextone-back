import TicketEntity from "@/entities/Ticket.entity";
import {
  PaginationInput,
  Status,
  UpdateStatusTicketInput,
  UpdateTicketInput,
} from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";
import CompanyService from "./company.service";
import { GraphQLError } from "graphql";
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
} from "typeorm";

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

  public async updateTicket(id: string, data: UpdateTicketInput, manager: ManagerEntity) {
    const updated = await this.repo.update(id, data);
    if (!updated) {
      throw new Error("Nothing affected.");
    }
    const found = await this.findById(id);

    if (!found) {
      throw new Error("Entity not found after update");
    }
    //CREATION DU TICKETLOG
    const ticketLog = new TicketLogEntity();
    ticketLog.ticket = found;
    ticketLog.manager = manager;
    ticketLog.status = Status.Updated;
    await TicketLogService.getInstance().createOne(ticketLog);

    return found;
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

  // PAGINATION TEMPS REEL  = A ENLEVER OU MODIFIER
  async findByPropertiesAndCount(
    fields: FindOptionsWhere<TicketEntity>,
    pagination?: PaginationInput
  ): Promise<{ items: TicketEntity[]; totalCount: number }> {
    const totalCount = await this.repo.count({ where: fields });

    const baseWhere: FindOptionsWhere<TicketEntity> = { ...fields };

    if (fields.status && Array.isArray(fields.status)) {
      baseWhere.status = In(fields.status as Status[]);
    }

    if (fields.lastName && typeof fields.lastName === "string") {
      baseWhere.lastName = ILike(`%${fields.lastName}%`);
    }

    let where:
      | FindOptionsWhere<TicketEntity>
      | FindOptionsWhere<TicketEntity>[];

    if (!pagination?.cursor) {
      where = baseWhere;
    } else {
      const cursorTicket = await this.repo.findOne({
        where: { id: pagination.cursor },
        select: ["updatedAt", "id"],
      });

      if (!cursorTicket) {
        throw new Error("Invalid cursor");
      }

      const { updatedAt, id } = cursorTicket;

      if (pagination.order === "ASC") {
        where = [
          { ...baseWhere, updatedAt: MoreThan(updatedAt) },
          { ...baseWhere, updatedAt, id: MoreThan(id) },
        ];
      } else {
        where = [
          { ...baseWhere, updatedAt: LessThan(updatedAt) },
          { ...baseWhere, updatedAt, id: LessThan(id) },
        ];
      }
    }

    const items = await this.repo.find({
      where,
      order: {
        updatedAt: pagination?.order ?? "DESC",
      },
      take: pagination?.limit ?? 50,
      skip: pagination?.offset ?? 0,
    });

    return { items, totalCount };
  }

  async findAllPaginated(
    companyId: string,
    pagination?: PaginationInput
  ): Promise<{ items: TicketEntity[]; totalCount: number }> {
    return this.findByPropertiesAndCount(
      {
        service: {
          companyId,
        },
      },
      pagination
    );
  }

  public async countAll(pagination?: PaginationInput): Promise<number> {
    const where: FindOptionsWhere<TicketEntity> = {};

    if (pagination?.cursor) {
      where.createdAt = MoreThanOrEqual(new Date(pagination.cursor));
    }
    return await this.repo.count({ where });
  }

  public async findTicketForTv(
    ip: string,
    serviceId?: string,
    count: number = 5
  ): Promise<TicketEntity[]> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return await this.repo.find({
      where: {
        status: Status.Pending,
        service: {
          id: serviceId,
          company: {
            whitelistedIps: {
              ipAddress: ip,
            },
          },
        },
        createdAt: Between(start, end),
      },
      order: { createdAt: "ASC" },
      take: count,
    });
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
      return;
    }
    if (ticket.service.companyId !== companyId) {
      throw new GraphQLError("Forbidden.");
    }
  }
}
