import { MutationGenerateTicketArgs, MutationUpdateTicketArgs } from "@/generated/graphql";
import TicketRepository from "@/repositories/ticket.repository";

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

  // async getTicketByServiceId(serviceId: string) {
  //   const tickets = await this.db.findBy({
  //     where: { serviceId },
  //   });
  //   if (!tickets) {
  //     throw new Error("No tickets found for this service");
  //   }
  //   return tickets;
  // }

  async generateTicket({ ...ticket }: MutationGenerateTicketArgs["data"]) {
    const newTicket = this.db.create(ticket);
    const savedTicket = await this.db.save(newTicket);
    return savedTicket;
  }

  async deleteTicket(id: string) {
    const deletedTicket = await this.db.delete(id);
    if (deletedTicket.affected === 0) {
      return false
    }
    return true;
  }

  async updateTicket(id: string, { ...ticket }: MutationUpdateTicketArgs["data"]) {
    const ticketFound = await this.getTicketById(id);
    const ticketUpdated = this.db.merge(ticketFound, { ...ticket });
    return await this.db.save(ticketUpdated);
  }
}