import TicketEntity from "@/entities/Ticket.entity";
import {
  UpdateStatusTicketInput,
} from "@/generated/graphql";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import BaseService from "./base.service";

export default class TicketService extends BaseService<TicketEntity> {
  // db: TicketRepository;

  // constructor() {
  //   this.db = new TicketRepository();
  // }

  private static instance: TicketService | null = null

  private constructor() {
    super(TicketEntity)
  }

  public static gettInstance(): TicketService {
    if (this.instance === null) {
      this.instance = new TicketService()
    }

    return this.instance;
  }

  // async getAllTickets() {
  //   return await this.db.find();
  // }

  // async getTicketById(id: string) {
  //   const ticket = await this.db.findOne({
  //     where: { id },
  //   });
  //   if (!ticket) {
  //     throw new Error("No ticket found");
  //   }
  //   return ticket;
  // }

  // async getTicketsByServiceId(serviceId: string) {
  //   const tickets = await this.db.findBy({
  //     where: { serviceId },
  //   });
  //   if (!tickets) {
  //     throw new Error("No tickets found for this service");
  //   }
  //   return tickets;
  // }

  // async generateTicket({ ...ticket }: GenerateTicketInput) {
  //   const newTicket = this.db.create(ticket);
  //   const savedTicket = await this.db.save(newTicket);
  //   return savedTicket;
  // }

  // async deleteTicket(id: string) {
  //   const deletedTicket = await this.db.delete(id);
  //   if (deletedTicket.affected === 0) {
  //     return false;
  //   }
  //   return true;
  // }

  // async updateTicket(id: string, { ...ticket }: UpdateTicketInput) {
  //   const ticketFound = await this.getTicketById(id);
  //   const ticketUpdated = this.db.merge(ticketFound, { ...ticket });
  //   return await this.db.save(ticketUpdated);
  // }

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
}
