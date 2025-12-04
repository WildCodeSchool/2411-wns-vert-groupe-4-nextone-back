import TicketLogEntity from "@/entities/TicketLog.entity";
import {
  DeleteResponse,
  MutationCreateTicketLogArgs,
  MutationDeleteTicketLogArgs,
  MutationUpdateTicketLogArgs,
  QueryTicketLogsArgs,
  QueryTicketLogsByCreationSlotArgs,
  QueryTicketLogsByPropertiesArgs,
  QueryTicketLogsByPropertyArgs,
} from "@/generated/graphql";
import TicketLogService from "@/services/ticketLogs.service";
import { buildResponse } from "@/utils/authorization";
import ManagerService from "@/services/manager.service";
import TicketService from "@/services/ticket.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { MyContext, ResolverWrapper } from "..";


const ticketLogService = TicketLogService.getInstance();

const ticketLogResovler = {
  Query: {
    async ticketLog(
      _: any,
      { id }: { id: string }
    ): Promise<TicketLogEntity | null> {
      return await ticketLogService.findById(id);
    },

    async ticketLogs(
      _: any,
      { pagination }: QueryTicketLogsArgs,
      ctx: MyContext
    ): Promise<{ items: TicketLogEntity[]; totalCount: number }> {
      return await ticketLogService.findAllPaginated(
        ctx.manager?.companyId!,
        pagination
      );
    },

    async ticketLogsByProperty(
      _: any,
      args: QueryTicketLogsByPropertyArgs,
      ctx: MyContext
    ): Promise<{ items: TicketLogEntity[]; totalCount: number }> {
      let key = Object.keys(args.field)[0] as keyof typeof args.field;
      const value = args.field[key];
      const ticketLogs = await ticketLogService.findByProperties({
        [key]: value,
        ticket: {
          service: {
            companyId: ctx.manager?.companyId!,
          },
        },
      });
      return ticketLogs;
      // return await ticketLogService.findByProperty(key, value, args.pagination);
    },

    async ticketLogsByProperties(
      _: any,
      { fields, pagination }: QueryTicketLogsByPropertiesArgs,
      ctx: MyContext
    ): Promise<{ items: TicketLogEntity[]; totalCount: number }> {
      return await ticketLogService.findByPropertiesAndCount(
        {
          ...fields,
          ticket: { service: { companyId: ctx.manager?.companyId! } },
        },
        pagination
      );
    },

    async ticketLogsByCreationSlot(
      _: any,
      args: QueryTicketLogsByCreationSlotArgs
    ): Promise<{ items: TicketLogEntity[]; totalCount: number }> {
      const items = await ticketLogService.findByCreationSlot({ ...args.data });
      const totalCount = items.length;
      return { items, totalCount };
    },
  },

  Mutation: {
    async createTicketLog(
      _: any,
      { data }: MutationCreateTicketLogArgs
    ): Promise<TicketLogEntity> {
      const newTicket = await ticketLogService.createOne({
        ...data,
        manager: data.managerId,
        ticket: data.ticketId,
      });
      return newTicket;
    },

    async updateTicketLog(
      _: any,
      args: MutationUpdateTicketLogArgs
    ): Promise<TicketLogEntity | null> {
      return await ticketLogService.updateOne(args.data.id, args.data);
    },

    async deleteTicketLog(
      _: any,
      { id }: MutationDeleteTicketLogArgs
    ): Promise<DeleteResponse> {
      const deleted = await ticketLogService.deleteOne(id);
      return buildResponse(
        deleted,
        `Ticket log ${id} deleted.`,
        `failed to delete ticket log ${id}`
      );
    },
  },

  TicketLog: {
    manager: async (parent: TicketLogEntity) => {
      return await new ManagerService().db.findOne({
        where: {
          ticketLogs: {
            id: parent.id,
          },
        },
      });
    },
    ticket: async (parent: TicketLogEntity) => {
      return await TicketService.gettInstance().findById(parent.ticketId);
    },
  },
};

const isUpdateAuthorized =
  (): ResolverWrapper<MutationCreateTicketLogArgs> =>
  (next) =>
  async (root, args, context, info) => {
    await TicketLogService.getInstance().checkTicketLog(args.data.ticketId, context.manager?.companyId!)
    return next(root, args, context, info);
  };

const isTicketLogCreationAuthorized =
  (): ResolverWrapper<MutationCreateTicketLogArgs> =>
  (next) =>
    async (root, args, context, info) => {

    await TicketService.gettInstance().checkTicket(args.data.ticketId, context.manager?.companyId!)

    if (args.data.managerId) {
      await new ManagerService().checkManager(args.data.managerId, context.manager?.companyId!)
    }

    return next(root, args, context, info);
  };

const isTicketLogFromCompany =
  (): ResolverWrapper<MutationDeleteTicketLogArgs> =>
  (next) =>
  async (root, args, context, info) => {
    await TicketLogService.getInstance().checkTicketLog(args.id, context.manager?.companyId!)

    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
  "Mutation.deleteTicketLog": [isTicketLogFromCompany()],
  "Mutation.createTicketLog": [isTicketLogCreationAuthorized()],
  "Mutation.updateTicketLog": [isUpdateAuthorized()],
  "Query.ticketlog": [isTicketLogFromCompany()],
};

export default composeResolvers(ticketLogResovler, composition);
