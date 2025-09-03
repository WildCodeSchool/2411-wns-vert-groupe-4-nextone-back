import TicketEntity from "@/entities/Ticket.entity";
import { Status, UpdateStatusTicketInput } from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";
import { Between } from "typeorm";

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

  async TodayTicket(serviceId: string): Promise<number> {
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    try {
      const totalTicket = await this.repo.count({
        where: {
          service: { id: serviceId},
          createdAt: Between(start, end),
        },
      });
      return totalTicket
    } catch (error: any) {
      console.log("ERROR : ", error?.message)
      return 0
    }
  }
}
