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
import ServicesService from "@/services/services.service";
import TicketLogService from "@/services/ticketLogs.service";

type TicketDeleted = {
  message: string;
  success: boolean;
};

const ticketService = TicketService.gettInstance();

export default {
  Query: {
    tickets: async (_: any): Promise<TicketEntity[]> => {
      const ticketsList = await ticketService.findAll();
      return ticketsList;
    },

    ticket: async (
      _: any,
      { id }: QueryTicketArgs
    ): Promise<TicketEntity | null> => {
      const ticket = await ticketService.findById(id);
      return ticket;
    },
  },
  Mutation: {
    generateTicket: async (
      _: any,
      { data }: MutationGenerateTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity> => {
      const service = await new ServicesService().findOne({
        where: {
          id: data.serviceId,
        }
      });
      if (!service) {
        throw new Error("No service with this id.");
      }
      const creationData = { ...data, service };
      const newTicket = await ticketService.createOne(creationData);
      return newTicket;
    },
    deleteTicket: async (
      _: any,
      { id }: QueryTicketArgs,
      ctx: MyContext
    ): Promise<TicketDeleted> => {
      const isTicketDeleted = await ticketService.deleteOne(id);

      if (!isTicketDeleted) {
        return { message: "Ticket not found", success: isTicketDeleted };
      }

      return { message: "Ticket deleted", success: isTicketDeleted };
    },
    updateTicket: async (
      _: any,
      { data }: MutationUpdateTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity | null> => {
      const updated = await ticketService.updateOne(data.id, data);
      return updated;
    },
    updateTicketStatus: async (
      _: any,
      args: MutationUpdateTicketStatusArgs,
      ctx: MyContext
    ): Promise<TicketEntity> => {
      if (!ctx.manager) {
        throw new Error(
          "Vous devez etre connecté pour mettre à jour le status d'un ticket."
        );
      }
      const updated = await ticketService.updateTicketStatus(
        args.data,
        ctx.manager
      );

      return updated;
    },
  },
  Ticket: {
    service: async (ticket: TicketEntity) => {
      const service = await new ServicesService().db.findOneBy({
        id: ticket.serviceId
      })
      return service
    },
    ticketLogs: async (ticket: TicketEntity) => {
      const ticketLogs = await TicketLogService.getInstance().findByProperties({
        ticket: {
          id: ticket.id
        }
      })
      return ticketLogs
    }
  }
};
