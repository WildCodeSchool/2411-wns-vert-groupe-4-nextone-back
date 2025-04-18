import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import { MutationGenerateTicketArgs, MutationUpdateTicketArgs, QueryGetTicketArgs } from "@/generated/graphql";
import { MyContext } from "..";

type TicketDeleted = {
  message: string;
  success: boolean;
}

export default {
    Query: {
        getTickets: async (
          _: any,
        ): 
        Promise<TicketEntity[]> => {
          const ticketsList = await new TicketService().getAllTickets();
          return ticketsList;
        },
        getTicket: async (_: any, { id }: QueryGetTicketArgs): Promise<TicketEntity> => {
          const ticket = await new TicketService().getTicketById(id);
          return ticket;
        },
        // getServiceTickets: async (_: any, { id }: QueryGetTicketArgs): Promise<TicketEntity[]> => {
        //   const tickets = await new TicketService().getTicketByServiceId(id);
        //   return tickets;
        // },
    },
    Mutation: {
      generateTicket: async (_: any, { data }: MutationGenerateTicketArgs,
        ctx: MyContext): Promise<TicketEntity> => {
          const newTicket = await new TicketService().generateTicket({...data});
          return newTicket;
      },
      deleteTicket: async (_: any, { id }: QueryGetTicketArgs,
        ctx: MyContext): Promise<TicketDeleted> => {
          const isTicketDeleted = await new TicketService().deleteTicket(id);

          if(!isTicketDeleted) {
            return { message: "Ticket not found", success: isTicketDeleted };
          }

          return { message: "Ticket deleted", success: isTicketDeleted };
      },
      updateTicket: async (_: any, { data }: MutationUpdateTicketArgs,
        ctx: MyContext): Promise<TicketEntity> => {
          const ticketUpdated = await new TicketService().updateTicket(data.id, {...data});
          return ticketUpdated;
      },
    }
};