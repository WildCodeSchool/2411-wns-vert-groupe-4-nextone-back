import TicketLogEntity from "@/entities/TicketLog.entity";
import {
  AuthorizationResponse,
  DeleteResponse,
  MutationCreateTicketLogArgs,
  MutationDeleteTicketLogArgs,
  MutationUpdateTicketLogArgs,
  QueryTicketLogsArgs,
  QueryTicketLogsByCreationSlotArgs,
  QueryTicketLogsByPropertiesArgs,
  QueryTicketLogsByPropertyArgs,
} from "@/generated/graphql";
import ManagerService from "@/services/manager.service";
import TicketService from "@/services/ticket.service";
import TicketLogService from "@/services/ticketLogs.service";
import { buildResponse } from "@/utils/authorization";
import { MyContext } from "..";

const ticketLogService = TicketLogService.getInstance();

export default {
  Query: {
    async ticketLog(
      _: any,
      { id }: { id: string }
    ): Promise<TicketLogEntity | null> {
      return await ticketLogService.findById(id);
    },

    async ticketLogs(_: any, { pagination }: QueryTicketLogsArgs): Promise<TicketLogEntity[]> {
      const tickets = await ticketLogService.findAll(pagination);
      return tickets;
    },

    async ticketLogsByProperty(_: any, args: QueryTicketLogsByPropertyArgs) {
      let key = Object.keys(args.field)[0] as keyof typeof args.field;
      const value = args.field[key];
      const tl = await ticketLogService.findByProperty(key, value, args.pagination);
      return tl
    },

    async ticketLogsByProperties(
      _: any,
      { fields }: QueryTicketLogsByPropertiesArgs
    ) {
      return await ticketLogService.findByProperties(fields);
    },

    async ticketLogsByCreationSlot(
      _: any,
      args: QueryTicketLogsByCreationSlotArgs
    ) {
      return await ticketLogService.findByCreationSlot({ ...args.data });
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
    manager: async (parent: TicketLogEntity, _: any, { loaders: { managerLoader } }: MyContext) => {
      return await managerLoader.load(parent.managerId || "");
    },
    ticket: async (parent: TicketLogEntity, _: any, { loaders: { ticketLoader } }: MyContext) => {
      return await ticketLoader.load(parent.ticketId);
    },
  },
};
