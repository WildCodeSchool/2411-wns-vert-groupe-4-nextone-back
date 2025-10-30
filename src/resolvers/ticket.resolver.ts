import TicketService from "@/services/ticket.service";
import TicketEntity from "@/entities/Ticket.entity";
import {
  MutationGenerateTicketArgs,
  MutationUpdateTicketArgs,
  MutationUpdateTicketStatusArgs,
  QueryTicketArgs,
  QueryTicketsArgs,
  QueryTicketsByPropertiesArgs,
  Status,
} from "@/generated/graphql";
import { MyContext } from "..";
import ServicesService from "@/services/services.service";
import { In, Not } from "typeorm";
import { TICKET_ADDED, pubsub } from "../pub_sub/ticketsByProperties";
import WhitelistedIpService from "@/services/whitelistedIp.service";

type TicketDeleted = {
  message: string;
  success: boolean;
};

const ticketService = TicketService.gettInstance();

export default {
  Query: {
    tickets: async (
      _: any,
      { pagination }: QueryTicketsArgs
    ): Promise<{ items: TicketEntity[]; totalCount: number }> => {
      // const ticketsList = await ticketService.findAll(pagination);
      // const totalCount = await ticketService.countAll(pagination);
      // return { items: ticketsList, totalCount };
      return await ticketService.findAllPaginated(pagination);
    },
    ticketsForTVDisplay: async (
      _: any,
      { pagination }: QueryTicketsArgs,
      { ip }: MyContext
    ): Promise<TicketEntity[] | null> => {
      console.log("IP du client :", ip);
      const whitelistedIpService = new WhitelistedIpService();

      const whitelistedIPs = await whitelistedIpService.getAllWhitelistedIps();

      const ipIsWhitelisted = whitelistedIPs.some(
        (ipEntry) => ipEntry.ipAddress === ip
      );

      if (!ipIsWhitelisted) {
        return null;
      }

      const ticketsList = await ticketService.findAll(pagination);
      return ticketsList;
    },
    ticket: async (
      _: any,
      { id }: QueryTicketArgs
    ): Promise<TicketEntity | null> => {
      const ticket = await ticketService.findById(id);
      return ticket;
    },

    ticketsByProperties: async (
      _: any,
      { fields, pagination }: QueryTicketsByPropertiesArgs
    ): Promise<{ items: TicketEntity[]; totalCount: number }> => {
      const { status, ...rest } = fields || {};
      console.log("fields", fields);
      console.log("rest", rest);
      console.log("status", status);
      if (status) {
        return await ticketService.findByPropertiesAndCount(
          { ...rest, status: In(status) },
          pagination
        );
      }
      //return await ticketService.findByPropertiesAndCount(rest, pagination);
      return await ticketService.findByPropertiesAndCount(
        { ...rest, status: Not(Status.Archived) },
        pagination
      );
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
        },
      });
      if (!service) {
        throw new Error("No service with this id.");
      }
      const creationData = { ...data, service };
      const newTicket = await ticketService.createOne(creationData);
      await pubsub.publish(TICKET_ADDED, { ticketAdded: newTicket });
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
      return await new ServicesService().getServiceById(ticket.serviceId);
    },
    ticketLogs: async (ticket: TicketEntity, _: any, ctx: MyContext) => {
      return await ctx.loaders.ticketLogByTicketIdLoader.load(ticket.id);
    },
  },

  Subscription: {
    ticketAdded: {
      subscribe: () => { return pubsub.asyncIterableIterator([TICKET_ADDED])},
    },
  },
};
