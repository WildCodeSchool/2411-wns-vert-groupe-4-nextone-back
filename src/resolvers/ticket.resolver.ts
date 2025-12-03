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
import { MyContext, ResolverWrapper } from "..";
import ServicesService from "@/services/services.service";
import { In } from "typeorm";
import {
  TICKET_ADDED,
  pubsub as localPubsub,
} from "../subscriptions/ticketsByProperties";
import WhitelistedIpService from "@/services/whitelistedIp.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { IResolvers } from "@graphql-tools/utils";
import { GraphQLError } from "graphql";
import { GraphQLFieldResolver } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { pubsub } from "@/lib/pubsub";
import { EVENTS } from "@/subscriptions/events";


type TicketDeleted = {
  message: string; 
  success: boolean;
};

const ticketService = TicketService.gettInstance();

const ticketResolver = {
  Query: {
    tickets: async (
      _: any,
      { pagination }: QueryTicketsArgs,
      ctx: MyContext
    ): Promise<{ items: TicketEntity[]; totalCount: number }> => {
      // const ticketsList = await ticketService.findAll(pagination);
      // const totalCount = await ticketService.countAll(pagination);
      // return { items: ticketsList, totalCount };
      return await ticketService.findAllPaginated(
        ctx.manager?.companyId!,
        pagination
      );
    },
    ticketsForTVDisplay: async (
      _: any,
      { pagination }: QueryTicketsArgs,
      { ip, manager }: MyContext
    ): Promise<TicketEntity[] | null> => {
      console.log("IP du client :", ip);
      const whitelistedIpService = new WhitelistedIpService();

      const whitelistedIPs = await whitelistedIpService.getAllWhitelistedIps(manager?.companyId!);

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
      { id }: QueryTicketArgs,
      ctx: MyContext
    ): Promise<TicketEntity | null> => {
      const ticket = await ticketService.findById(id);
      if (ticket?.service.companyId !== ctx.manager?.companyId) {
        return null;
      }
      return ticket;
    },

    ticketsByProperties: async (
      _: any,
      { fields, pagination }: QueryTicketsByPropertiesArgs,
      ctx: MyContext
    ): Promise<{ items: TicketEntity[]; totalCount: number }> => {
      const { status, ...rest } = fields || {};
      if (status) {
        return await ticketService.findByPropertiesAndCount(
          {
            ...rest,
            status: In(status),
            service: { companyId: ctx.manager?.companyId! },
          },
          pagination
        );
      }
      //return await ticketService.findByPropertiesAndCount(rest, pagination);
      return await ticketService.findByPropertiesAndCount(
        {
          ...rest,
          status: Not(Status.Archived),
          service: { companyId: ctx.manager?.companyId! },
        },
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
        return { message: "Ticket not found", success: false };
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
      const updated = await ticketService.updateTicketStatus(
        args.data,
        ctx.manager!
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
        return pubsub.asyncIterableIterator(EVENTS.TICKET_CREATED);
      },
    },

    ticketUpdated: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketUpdated");
        return pubsub.asyncIterableIterator(EVENTS.TICKET_UPDATED);
      },
    },

    ticketDeleted: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketDeleted");
        return pubsub.asyncIterableIterator(EVENTS.TICKET_DELETED);
      },
    },

    ticketStatusChanged: {
      subscribe: withFilter(
        () => {
          console.log("✅ Subscription active : ticketStatusChanged");
          return pubsub.asyncIterableIterator(EVENTS.TICKET_STATUS_CHANGED);
        },
        (payload, variables) => {
          return payload.ticketStatusChanged.id === variables.ticketId;
        }
      ),
    },

    ticketsChanged: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketsChanged (global refresh)");
        return pubsub.asyncIterableIterator(EVENTS.TICKETS_CHANGED);
      },
    },

    ticketAdded: {
      subscribe: () => {
        console.log("✅ Subscription active : ticketAdded (legacy system)");
        return localPubsub.asyncIterableIterator(TICKET_ADDED);
      },
    },

    ticketAddedByProperties: {
      subscribe: (_: any, { fields }: QueryTicketsByPropertiesArgs) =>
        pubsub.asyncIterableIterator(TICKET_ADDED),
      resolve: (
        payload: { ticketAdded: TicketEntity },
        args: QueryTicketsByPropertiesArgs
      ) => {
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

  Subscription: {
    ticketAdded: {
      subscribe: () => {
        return pubsub.asyncIterableIterator([TICKET_ADDED]);
      },
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

const isTicketFromThisCompany =
  (): ResolverWrapper<MutationUpdateTicketArgs> => (next) => async (root, args, context, info) => {
    const ticket = await ticketService.findById(args.data.id);
    if (!ticket || ticket.service.companyId !== context.manager?.companyId) {
      throw new GraphQLError("No ticket available with this ID.", {
        extensions: {
          type: "INVALID_TICKET"
        }
      })
    }
    return next(root, args, context, info);
  };

const isServiceFromThisCompany =
  (): ResolverWrapper<MutationGenerateTicketArgs> => (next) => async (root, args, context, info) => {
    const service = await new ServicesService().db.findOne({
      where: {
        id: args.data.serviceId
      }
    })

    if (!service || service.companyId !== context.manager?.companyId) {
      throw new GraphQLError("No service available with this ID.", {
        extensions: {
          type: "INVALID_SERVICE"
        }
      })
    }
    return next(root, args, context, info);
  };

const composition = {
  "Query.*": [isAuthenticated()],
  "Mutation.{updateTicket, updateTicketStatus, deleteTicket}": [isAuthenticated(), isTicketFromThisCompany()],
  "Mutation.generateTicket":[isAuthenticated(), isServiceFromThisCompany()]
};
const composedResolver = composeResolvers(ticketResolver, composition);
export default composedResolver;
