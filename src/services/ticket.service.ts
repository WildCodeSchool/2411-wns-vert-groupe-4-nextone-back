import TicketRepository from "@/repositories/ticket.repository";

export default class TicketService {
  db: TicketRepository;

  constructor() {
    this.db = new TicketRepository();
  }

  async listTickets() {
    return await this.db.findAll();
  }
}