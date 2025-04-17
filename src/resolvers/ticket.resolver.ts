import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import { MutationCreateTicketArgs, MutationUpdateTicketArgs, QueryFindTicketArgs } from "@/generated/graphql";
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
      },
      deleteTicket: async (_: any, { id }: QueryFindTicketArgs,
        ctx: MyContext): Promise<string> => {
          const ticketDeleted = await new TicketService().delete(id);
          return `Le ticket ${ticketDeleted} a bien été supprimé`;
      },
      updateTicket: async (_: any, { data }: MutationUpdateTicketArgs,
        ctx: MyContext): Promise<TicketEntity> => {
          const ticketUpdated = await new TicketService().update(data.id, {...data});
          return ticketUpdated;
      },
    }
};