import TicketLogsEntity from "@/entities/TicketLog.entity";
import {
  DeletedTicketResponse,
  DeleteResponse,
  MutationCreateTicketLogArgs,
  MutationDeleteTicketLogArgs,
  MutationUpdateTicketLogArgs,
  QueryTicketLogsByPropertyArgs,
} from "@/generated/graphql";
import TicketLogService from "@/services/ticketLogs.service";

const ticketLogService = TicketLogService.getInstance();

export default {
  Query: {
    async ticketLog(
      _: any,
      { id }: { id: string }
    ): Promise<TicketLogsEntity | null> {
      return await ticketLogService.findById(id);
    },
    async ticketLogs(): Promise<TicketLogsEntity[]> {
      return await ticketLogService.findAll();
    },
    async ticketLogsByProperty(_: any, args: QueryTicketLogsByPropertyArgs) {
      const key = Object.keys(args.field)[0] as keyof typeof args.field
      const value = args.field[key]
    
      return await ticketLogService.findByProperty(key, value);
    }
  },
  Mutation: {
    async createTicketLog(
      _: any,
      args: MutationCreateTicketLogArgs
    ): Promise<TicketLogsEntity> {
      return await ticketLogService.createOne(args.data);
    },
    async updateTicketLog(
      _: any,
      args: MutationUpdateTicketLogArgs
    ): Promise<TicketLogsEntity | null> {
      return await ticketLogService.updateOne(args.data.id, args.data);
    },
    async deleteTicketLog(_: any, { id }: MutationDeleteTicketLogArgs): Promise<DeleteResponse> {
      const deleted = await ticketLogService.deleteOne(id)
      if (deleted) {
        return {
          success: true,
          content: `Ticket log ${id} deleted.`
        }
      }
      return {
        success: false,
        content: `failed to delete ticket log ${id}`
      }
    }
  },
};
