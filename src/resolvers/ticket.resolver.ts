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
  Ticket,
} from "@/generated/graphql";
import { MyContext } from "..";
import ServicesService from "@/services/services.service";
import { In } from "typeorm";
import {
  TICKET_ADDED,
  pubsub as localPubsub,
} from "../pub_sub/ticketsByProperties";
import WhitelistedIpService from "@/services/whitelistedIp.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { IResolvers } from "@graphql-tools/utils";
import { GraphQLFieldResolver } from "graphql";
import { PubSub, withFilter } from "graphql-subscriptions";
import { EVENTS } from "@/subscribers/events";

const pubsub = new PubSub();

type TicketDeleted = {
  message: string;
  success: boolean;
};

const ticketService = TicketService.gettInstance();

const ticketResolver = {
  Query: {
    tickets: async (
      _: any,
      { pagination }: QueryTicketsArgs
    ): Promise<{ items: TicketEntity[]; totalCount: number }> => {
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
      if (status) {
        return await ticketService.findByPropertiesAndCount(
          { ...rest, status: In(status) },
          pagination
        );
      }
      return await ticketService.findByPropertiesAndCount(rest, pagination);
      // return await ticketService.findByPropertiesAndCount(
      //   { ...rest, status: Not(Status.Archived) },
      //   pagination
      // );
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
      await localPubsub.publish(TICKET_ADDED, { ticketAdded: newTicket });
      await pubsub.publish(EVENTS.TICKET_CREATED, { ticketCreated: newTicket });
      await pubsub.publish(EVENTS.TICKETS_CHANGED, {
        ticketsChanged: newTicket,
      });

      return newTicket;
    },

    deleteTicket: async (
      _: any,
      { id }: QueryTicketArgs,
      ctx: MyContext
    ): Promise<TicketDeleted> => {
      const ticketToDelete = await ticketService.findById(id);
      const isTicketDeleted = await ticketService.deleteOne(id);
      if (!isTicketDeleted) {
        return { message: "Ticket not found", success: isTicketDeleted };
      }
      // MR
      if (ticketToDelete) {
        ticketToDelete.status = Status.Deleted;
        await pubsub.publish(EVENTS.TICKETS_CHANGED, {
          ticketsChanged: ticketToDelete,
        });

        await pubsub.publish(EVENTS.TICKET_DELETED, { ticketDeleted: { id } });
      }

      return { message: "Ticket deleted", success: isTicketDeleted };
    },

    updateTicket: async (
      _: any,
      { data }: MutationUpdateTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity | null> => {
      const updated = await ticketService.updateOne(data.id, data);
      // MR
      if (updated) {
        await pubsub.publish(EVENTS.TICKET_UPDATED, { ticketUpdated: updated });
        await pubsub.publish(EVENTS.TICKETS_CHANGED, {
          ticketsChanged: updated,
        });
      }
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
      // MR
      await pubsub.publish(EVENTS.TICKET_STATUS_CHANGED, {
        ticketStatusChanged: updated,
      });
      await pubsub.publish(EVENTS.TICKETS_CHANGED, {
        ticketsChanged: updated,
      });
      return updated;
    },
  },

  // ============================================================================
  //  SUBSCRIPTIONS (WebSocket)
  // ============================================================================
  Subscription: {
    ticketCreated: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketCreated");
        return pubsub.asyncIterableIterator([EVENTS.TICKET_CREATED]);
      },
    },

    ticketUpdated: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketUpdated");
        return pubsub.asyncIterableIterator([EVENTS.TICKET_UPDATED]);
      },
    },

    ticketDeleted: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketDeleted");
        return pubsub.asyncIterableIterator([EVENTS.TICKET_DELETED]);
      },
    },

    ticketStatusChanged: {
      subscribe: withFilter(
        () => {
          console.log("✅ Subscription active : ticketStatusChanged");
          return pubsub.asyncIterableIterator([EVENTS.TICKET_STATUS_CHANGED]);
        },
        (payload, variables) => {
          return payload.ticketStatusChanged.id === variables.ticketId;
        }
      ),
    },

    ticketsChanged: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketsChanged (global refresh)");
        return pubsub.asyncIterableIterator([EVENTS.TICKETS_CHANGED]);
      },
    },

    ticketAdded: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketAdded (legacy system)");
        return localPubsub.asyncIterableIterator([TICKET_ADDED]);
      },
    },

    ticketAddedByProperties: {
      subscribe: (_: any, { fields }: QueryTicketsByPropertiesArgs) => 
        pubsub.asyncIterableIterator(TICKET_ADDED),
      resolve: (payload: { ticketAdded: TicketEntity }, args: QueryTicketsByPropertiesArgs) => {
        const { status, ...rest } = args.fields || {};
        const ticket: any = payload.ticketAdded;
        if (status && !status.includes(ticket.status)) return null;
        const ticketAny = ticket as Record<string, any>;
        const restAny = rest as Record<string, any>;
        for (const key in restAny) {
          if (ticketAny[key] !== restAny[key]) return null;
        }
        return ticket;
      },
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
};

type ResolverWrapper<TSource = any, TArgs = any, TResult = any> = (
  next: GraphQLFieldResolver<TSource, MyContext, TArgs, TResult>
) => GraphQLFieldResolver<TSource, MyContext, TArgs, TResult>;

const isAuthenticated =
  (): ResolverWrapper => (next) => (root, args, context, info) => {
    if (!context.manager) {
      throw new Error("You are not authenticated!");
    }

    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
};
const composedResolver = composeResolvers(ticketResolver, composition);
export default composedResolver;
