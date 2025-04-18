import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import { MutationCreateTicketArgs, MutationUpdateTicketArgs, QueryFindTicketArgs } from "@/generated/graphql";
import { MyContext } from "..";

type TicketDeleted = {
  message: string;
  success: boolean;
}

export default {
    Query: {
        tickets: async (
          _: any,
        ): 
        Promise<TicketEntity[]> => {
          const ticketsList = await new TicketService().list();
          return ticketsList;
        },
        findTicket: async (_: any, { id }: QueryFindTicketArgs): Promise<TicketEntity> => {
          const ticket = await new TicketService().findById(id);
          return ticket;
        },
    },
    Mutation: {
      createTicket: async (_: any, { data }: MutationCreateTicketArgs,
        ctx: MyContext): Promise<TicketEntity> => {
          const newTicket = await new TicketService().create({...data});
          return newTicket;
      },
      deleteTicket: async (_: any, { id }: QueryFindTicketArgs,
        ctx: MyContext): Promise<TicketDeleted> => {
          const isTicketDeleted = await new TicketService().delete(id);

          if(!isTicketDeleted) {
            return { message: "Ticket not found", success: isTicketDeleted };
          }

          return { message: "Ticket deleted", success: isTicketDeleted };
      },
      updateTicket: async (_: any, { data }: MutationUpdateTicketArgs,
        ctx: MyContext): Promise<TicketEntity> => {
          const ticketUpdated = await new TicketService().update(data.id, {...data});
          return ticketUpdated;
      },
    }
};