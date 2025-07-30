import TicketLogEntity from "@/entities/TicketLog.entity";
import {
  AuthorizationResponse,
  DeleteResponse,
  MutationCreateTicketLogArgs,
  MutationDeleteTicketLogArgs,
  MutationUpdateTicketLogArgs,
  QueryTicketLogsByCreationSlotArgs,
  QueryTicketLogsByPropertiesArgs,
  QueryTicketLogsByPropertyArgs,
} from "@/generated/graphql";
import TicketLogService from "@/services/ticketLogs.service";
import { buildResponse } from "@/utils/authorization";

const ticketLogService = TicketLogService.getInstance();

export default {
  Query: {
    async ticketLog(
      _: any,
      { id }: { id: string }
    ): Promise<TicketLogEntity | null> {
      return await ticketLogService.findById(id);
    },

    async ticketLogs(): Promise<TicketLogEntity[]> {
      const tickets = await ticketLogService.findAll();
      return tickets;
    },

    async ticketLogsByProperty(_: any, args: QueryTicketLogsByPropertyArgs) {
      let key = Object.keys(args.field)[0] as keyof typeof args.field;
      const value = args.field[key];

      return await ticketLogService.findByProperty(key, value);
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
      return buildResponse(deleted, `Ticket log ${id} deleted.`, `failed to delete ticket log ${id}`)
    },
  },
};
