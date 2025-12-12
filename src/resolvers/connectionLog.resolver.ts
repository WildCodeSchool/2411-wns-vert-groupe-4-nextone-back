import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import {
  ConnectionEnum,
  MutationCreateConnectionLogArgs,
  QueryConnectionLogsArgs,
  QueryEmployeeConnectionLogsArgs,
  QueryLoginLogsArgs,
  QueryLogoutLogsArgs,
} from "@/generated/graphql";
import ConnectionLogService from "@/services/connectionLog.service";
import ManagerService from "@/services/manager.service";
import { MyContext, ResolverWrapper } from "..";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";


const connectionLogService = new ConnectionLogService();

const connectionLogResolver = {
  Query: {
    connectionLogs: async (
      _: any,
      { pagination }: QueryConnectionLogsArgs,
      ctx: MyContext
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getAllConnectionLogsPaginated(
        ctx.manager?.companyId!,
        pagination
      );
    },

    loginLogs: async (
      _: any,
      { pagination }: QueryLoginLogsArgs,
      ctx: MyContext
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getConnectionLogsByTypePaginated(
        ctx.manager?.companyId!,
        ConnectionEnum.Login,
        pagination
      );
    },

    logoutLogs: async (
      _: any,
      { pagination }: QueryLogoutLogsArgs,
      ctx: MyContext
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getConnectionLogsByTypePaginated(
        ctx.manager?.companyId!,
        ConnectionEnum.Logout,
        pagination
      );
    },

    employeeConnectionLogs: async (
      _: any,
      { managerId, pagination }: QueryEmployeeConnectionLogsArgs
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getConnectionLogsByEmployeePaginated(
        managerId,
        pagination
      );
    },
  },

  Mutation: {
    createConnectionLog: async (
      _: any,
      { type, managerId }: { type: ConnectionEnum; managerId: string }
    ): Promise<ConnectionLogEntity> => {
      const connectionLog = await connectionLogService.createConnectionLog({
        type,
        managerId,
      });
      return connectionLog;
    },
  },

  ConnectionLog: {
    manager: async (parent: ConnectionLogEntity) => {
      return await new ManagerService().db.findOne({
        where: {
          connectionLogs: {
            id: parent.id,
          },
        },
      });
    },
  },
};

const isEmployeeFromCompany =
  (): ResolverWrapper<
    QueryEmployeeConnectionLogsArgs | MutationCreateConnectionLogArgs
  > =>
  (next) =>
    async (root, args, context, info) => {
    await new ManagerService().checkManager(args.managerId, context.manager?.companyId!)
    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
  "Query.employeeConnectionLogs": [isEmployeeFromCompany()],
  "Mutation.createConnectionLog": [isEmployeeFromCompany()],
};

export default composeResolvers(connectionLogResolver, composition);
