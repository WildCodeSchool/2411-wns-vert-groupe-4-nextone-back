import TicketLogEntity from "@/entities/TicketLog.entity";
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
import { DeepPartial } from "typeorm";

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
      const tickets = await ticketLogService.findAll();
      return tickets;
    },

    async ticketLogsByProperty(_: any, args: QueryTicketLogsByPropertyArgs) {
      let key = Object.keys(args.field)[0] as keyof typeof args.field;
      const value = args.field[key];
      console.log("KEY : ", key, "VALUE : ", value);
      //MAPPER LA KEY SI MANAGER OU TICKET
      let keyForService: keyof TicketLogEntity =
        key !== "managerId" ? (key !== "ticketId" ? key : "ticket") : "manager";
      console.log("SERVICEKEY : ", keyForService);
      // const test = await ticketLogService.findByProperty()
      return await ticketLogService.findByProperty(keyForService, value);
    },

  },
  Mutation: {
    async createTicketLog(
      _: any,
      { data }: MutationCreateTicketLogArgs
    ): Promise<TicketLogsEntity> {
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
    ): Promise<TicketLogsEntity | null> {
      return await ticketLogService.updateOne(args.data.id, args.data);
    },
    async deleteTicketLog(
      _: any,
      { id }: MutationDeleteTicketLogArgs
    ): Promise<DeleteResponse> {
      const deleted = await ticketLogService.deleteOne(id);
      if (deleted) {
        return {
          success: true,
          content: `Ticket log ${id} deleted.`,
        };
      }
      return {
        success: false,
        content: `failed to delete ticket log ${id}`,
      };
    },
  },
};
