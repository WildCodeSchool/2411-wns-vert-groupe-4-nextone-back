import {
  Resolver,
  Query,
  Arg,
  Mutation,
} from "type-graphql";
import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import ConnectionLogService from "@/services/connectionLog.service";
import { ConnectionEnum } from "@/generated/graphql";

@Resolver(() => ConnectionLogEntity)
export default class ConnectionLogResolver {
  private service = new ConnectionLogService();

  @Query(() => [ConnectionLogEntity])
  getConnectionLogs() {
    return this.service.getAllConnectionLogs();
  }

  @Query(() => [ConnectionLogEntity])
  getLoginLogs() {
    return this.service.getConnectionLogsByType(ConnectionEnum.Login);
  }

  @Query(() => [ConnectionLogEntity])
  getLogoutLogs() {
    return this.service.getConnectionLogsByType(ConnectionEnum.Logout);
  }

  @Query(() => [ConnectionLogEntity])
  getEmployeeConnectionLogs(@Arg("managerId") managerId: string) {
    return this.service.getConnectionLogsByEmployee(managerId);
  }

  @Mutation(() => ConnectionLogEntity)
  createConnectionLog(
    @Arg("type", () => ConnectionEnum) type: ConnectionEnum,
    @Arg("managerId") managerId: string
  ) {
    return this.service.createConnectionLog({ type, managerId });
  }
}
