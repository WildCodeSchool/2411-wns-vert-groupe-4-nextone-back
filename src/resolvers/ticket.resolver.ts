import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import { MutationCreateTicketArgs, QueryFindTicketArgs } from "@/generated/graphql";
import { MyContext } from "..";

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
        }
    }
};