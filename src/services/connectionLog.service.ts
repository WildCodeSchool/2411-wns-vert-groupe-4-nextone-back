import ConnectionLogRepository from '../repositories/ConnectionLog.repository';
import ConnectionLogEntity from '../entities/ConnectionLog.entity';
import { ConnectionEnum } from "@/generated/graphql";

export default class ConnectionLogService {
  private db = new ConnectionLogRepository();

  getAllConnectionLogs(): Promise<ConnectionLogEntity[]> {
    return this.db.find({ order: { createdAt: "DESC" } });
  }

  getConnectionLogsByType(type: ConnectionEnum): Promise<ConnectionLogEntity[]> {
    return this.db.find({ where: { type }, order: { createdAt: "DESC" } });       //tri affiche les logs les plus récents en premier
  }

  getConnectionLogsByEmployee(managerId: string): Promise<ConnectionLogEntity[]> {
    return this.db.find({ where: { managerId }, order: { createdAt: "DESC" } });
  }


  createConnectionLog(args: Partial<ConnectionLogEntity>): Promise<ConnectionLogEntity> {
    const newLog = this.db.create(args);
    return this.db.save(newLog);
  }
}