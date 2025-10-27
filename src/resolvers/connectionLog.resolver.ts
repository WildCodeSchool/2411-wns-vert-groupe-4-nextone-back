import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import { ConnectionEnum, QueryConnectionLogsArgs, QueryEmployeeConnectionLogsArgs, QueryLoginLogsArgs, QueryLogoutLogsArgs } from "@/generated/graphql";
import ConnectionLogService from "@/services/connectionLog.service";
import ManagerService from "@/services/manager.service";
import { MyContext } from "..";

const connectionLogService = new ConnectionLogService() 

export default {
  Query: {
      connectionLogs: async (
      _: any,
      { pagination }: QueryConnectionLogsArgs
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getAllConnectionLogsPaginated(pagination);
    },

    loginLogs: async (
      _: any,
      { pagination }: QueryLoginLogsArgs
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getConnectionLogsByTypePaginated(
        ConnectionEnum.Login,
        pagination
      );
    },

      logoutLogs: async (
      _: any,
      { pagination }: QueryLogoutLogsArgs
    ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> => {
      return await connectionLogService.getConnectionLogsByTypePaginated(
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
            id: parent.id
          }
        }
      })
    }
  }
}
