import { MutationCreateTicketArgs, MutationUpdateTicketArgs } from "@/generated/graphql";
import TicketRepository from "@/repositories/ticket.repository";

export default class TicketService {
  db: TicketRepository;

  constructor() {
    this.db = new TicketRepository();
  }

  async list() {
    return await this.db.find();
  }

  async findById(id: string) {
    const ticket = await this.db.findOne({
      where: { id },
    });
    if (!ticket) {
      throw new Error("No ticket found");
    }
    return ticket;
  }

  async create({ ...ticket }: MutationCreateTicketArgs["data"]) {
    const newTicket = this.db.create(ticket);
    const savedTicket = await this.db.save(newTicket);
    return savedTicket;
  }

  async delete(id: string) {
    const deletedTicket = await this.db.delete(id);
    if (deletedTicket.affected === 0) {
      throw new Error("Ticket to delete not found");
    }
    return id;
  }

  async update(id: string, { ...ticket }: MutationUpdateTicketArgs["data"]) {
    const ticketFound = await this.findById(id);
    const ticketUpdated = this.db.merge(ticketFound, { ...ticket });
    return await this.db.save(ticketUpdated);
  }
}