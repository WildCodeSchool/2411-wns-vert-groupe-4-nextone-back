import TicketEntity from "@/entities/Ticket.entity";
import {
  GenerateTicketInput,
  UpdateStatusTicketInput,
  UpdateTicketInput,
} from "@/generated/graphql";
import TicketRepository from "@/repositories/ticket.repository";
import TicketLogService from "./ticketLogs.service";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";

export default class TicketService {
  db: TicketRepository;

  constructor() {
    this.db = new TicketRepository();
  }

  async getAllTickets() {
    return await this.db.find();
  }

  async getTicketById(id: string) {
    const ticket = await this.db.findOne({
      where: { id },
    });
    if (!ticket) {
      throw new Error("No ticket found");
    }
    return ticket;
  }

  // async getTicketsByServiceId(serviceId: string) {
  //   const tickets = await this.db.findBy({
  //     where: { serviceId },
  //   });
  //   if (!tickets) {
  //     throw new Error("No tickets found for this service");
  //   }
  //   return tickets;
  // }

  async generateTicket({ ...ticket }: GenerateTicketInput) {
    const newTicket = this.db.create(ticket);
    const savedTicket = await this.db.save(newTicket);
    return savedTicket;
  }

  async deleteTicket(id: string) {
    const deletedTicket = await this.db.delete(id);
    if (deletedTicket.affected === 0) {
      return false;
    }
    return true;
  }

  async updateTicket(id: string, { ...ticket }: UpdateTicketInput) {
    const ticketFound = await this.getTicketById(id);
    const ticketUpdated = this.db.merge(ticketFound, { ...ticket });
    return await this.db.save(ticketUpdated);
  }

  async updateTicketStatus(
    { id, status }: UpdateStatusTicketInput,
    manager: ManagerEntity
  ): Promise<TicketEntity> {
    const found = await this.getTicketById(id);

    if (!found) {
      throw new Error("No ticket with this id.");
    }
    found.status = status;
    this.db.save(found);

    //ON CREE UN TICKETLOG AVEC LE NOUVEAU STATUS
    const ticketLog = new TicketLogEntity();
    ticketLog.ticket = found;
    ticketLog.manager = manager;
    ticketLog.status = status;
    await TicketLogService.getInstance().createOne(ticketLog);

    return found;
  }
}
