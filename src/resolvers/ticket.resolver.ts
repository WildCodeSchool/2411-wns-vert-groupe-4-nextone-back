import TicketService from "@/services/ticket.service";
import { MyContext } from "..";
import TicketEntity from "@/entities/Ticket.entity";

export default {
    Query: {
        tickets: async (
          _: any,
        ): 
        Promise<TicketEntity[]> => {
          const ticketsList = await new TicketService().listTickets();
          return ticketsList;
        },
    }
};