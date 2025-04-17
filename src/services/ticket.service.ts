import { MutationCreateTicketArgs } from "@/generated/graphql";
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
    console.log("data", ticket);
    const newTicket = this.db.create(ticket);
    const savedTicket = await this.db.save(newTicket);
    return savedTicket;
  }
}