import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import { ConnectionEnum } from "@/generated/graphql";
import ConnectionLogService from "@/services/connectionLog.service";
import ManagerService from "@/services/manager.service";
import { MyContext } from "..";

const connectionLogService = new ConnectionLogService() 

export default {
  Query: {
    connectionLogs:async () => {
      return await connectionLogService.getAllConnectionLogs()
    },
    loginLogs: async () => {
      return await connectionLogService.getConnectionLogsByType(ConnectionEnum.Login)
    },
    logoutLogs: async () => {
      return await connectionLogService.getConnectionLogsByType(ConnectionEnum.Logout)
    },
    employeeConnectionLogs: async (_: any, managerId: string) => {
      return await connectionLogService.getConnectionLogsByEmployee(managerId)
    }
  },
  Mutation: {
    createConnectionLog: async (type: ConnectionEnum, managerId: string) => {
      const connectionLog = await connectionLogService.createConnectionLog({ type, managerId })
      return connectionLog
    }
  },
  ConnectionLog: {
    manager: async (parent: ConnectionLogEntity,_: any, { loaders: { managerLoader }}: MyContext) => {
      return await managerLoader.load(parent.managerId)
    }
  }
}