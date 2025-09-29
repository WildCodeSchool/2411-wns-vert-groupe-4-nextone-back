import TicketEntity from "@/entities/Ticket.entity";
import { Status, UpdateStatusTicketInput } from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";
import { Any, FindOptionsWhere, In } from "typeorm";

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

  async ticketsByStatus(
    fields: FindOptionsWhere<TicketEntity>,
    statusList: Status[]
  ): Promise<TicketEntity[]> {
    return await this.repo.find({
      where: {
        ...fields,
        status: In(statusList)
      }
    });
  }
}
