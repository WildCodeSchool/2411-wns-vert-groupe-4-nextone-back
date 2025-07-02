import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import {
  DeletedTicketResponse,
  MutationGenerateTicketArgs,
  MutationUpdateTicketArgs,
  MutationUpdateTicketStatusArgs,
  QueryTicketArgs,
} from "@/generated/graphql";
import { MyContext } from "..";
import { buildResponse } from "@/utils/authorization";

type TicketDeleted = {
  message: string;
  success: boolean;
};

export default {
  Query: {
    tickets: async (_: any): Promise<TicketEntity[]> => {
      const ticketsList = await new TicketService().getAllTickets();
      return ticketsList;
    },
    ticket: async (
      _: any,
      { id }: QueryTicketArgs
    ): Promise<TicketEntity> => {
      const ticket = await new TicketService().getTicketById(id);
      return ticket;
    },
    // getServiceTickets: async (_: any, { id }: QueryGetTicketArgs): Promise<TicketEntity[]> => {
    //   const tickets = await new TicketService().getTicketByServiceId(id);
    //   return tickets;
    // },
  },
  Mutation: {
    generateTicket: async (
      _: any,
      { data }: MutationGenerateTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity> => {
      const newTicket = await new TicketService().generateTicket({ ...data });
      return newTicket;
    },
    deleteTicket: async (
      _: any,
      { id }: QueryTicketArgs,
      ctx: MyContext
    ): Promise<DeletedTicketResponse> => {
      const isTicketDeleted = await new TicketService().deleteTicket(id);
      return buildResponse(isTicketDeleted, "Ticket deleted", "Ticket not found")
    },
    updateTicket: async (
      _: any,
      { data }: MutationUpdateTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity> => {
      const ticketUpdated = await new TicketService().updateTicket(data.id, {
        ...data,
      });
      return ticketUpdated;
    },
    updateTicketStatus: async (
      _: any,
      args: MutationUpdateTicketStatusArgs,
      ctx: MyContext
    ): Promise<TicketEntity> => {
      if (!ctx.manager) {
        throw new Error('Vous devez etre connecté pour mettre à jour le status d\'un ticket.')
      }
      const updated = await new TicketService().updateTicketStatus(args.data, ctx.manager)
      
      return updated
    },
  },
};
