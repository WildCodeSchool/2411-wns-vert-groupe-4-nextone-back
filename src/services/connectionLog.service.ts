import ConnectionLogRepository from '../repositories/ConnectionLog.repository';
import ConnectionLogEntity from '../entities/ConnectionLog.entity';
import { ConnectionEnum, PaginationInput } from "@/generated/graphql";
import { FindOptionsWhere, MoreThanOrEqual } from "typeorm";

export default class ConnectionLogService {
  private db = new ConnectionLogRepository();

  async getAllConnectionLogsPaginated(
    companyId: string,
    pagination?: PaginationInput,
  ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> {
    return this.findPaginated({ manager: {companyId}}, pagination);
  }

  async getConnectionLogsByTypePaginated(
    companyId: string,
    type: ConnectionEnum,
    pagination?: PaginationInput
  ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> {
    return this.findPaginated({ type, manager: { companyId} }, pagination);
  }

  async getConnectionLogsByEmployeePaginated(
    managerId: string,
    pagination?: PaginationInput
  ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> {
    return this.findPaginated({ managerId }, pagination);
  }


  private async findPaginated(
    where: FindOptionsWhere<ConnectionLogEntity>,
    pagination?: PaginationInput
  ): Promise<{ items: ConnectionLogEntity[]; totalCount: number }> {
    
    console.log("🔍 ConnectionLog - where:", where);
    console.log("🔍 ConnectionLog - pagination:", pagination);
    
   
    const totalCount = await this.db.count({ where });
   
    const whereWithCursor: FindOptionsWhere<ConnectionLogEntity> = { ...where };
    
    if (pagination?.cursor) {
      whereWithCursor.createdAt = MoreThanOrEqual(new Date(pagination.cursor));
    }

    const items = await this.db.find({
      where: whereWithCursor,
      order: { createdAt: pagination?.order ?? "DESC" }, 
      take: pagination?.limit ?? 20,
    });

    console.log("ConnectionLog - totalCount:", totalCount);
    console.log("ConnectionLog - items.length:", items.length);

    return { items, totalCount };
  }

  // ⚠️ ANCIENNES MÉTHODES (si besoin)
  getAllConnectionLogs(): Promise<ConnectionLogEntity[]> {
    return this.db.find({ order: { createdAt: "DESC" } });
  }

  getConnectionLogsByType(type: ConnectionEnum): Promise<ConnectionLogEntity[]> {
    return this.db.find({ where: { type }, order: { createdAt: "DESC" } });
  }

  getConnectionLogsByEmployee(managerId: string): Promise<ConnectionLogEntity[]> {
    return this.db.find({ where: { managerId }, order: { createdAt: "DESC" } });
  }

  createConnectionLog(args: Partial<ConnectionLogEntity>): Promise<ConnectionLogEntity> {
    const newLog = this.db.create(args);
    return this.db.save(newLog);
  }
}