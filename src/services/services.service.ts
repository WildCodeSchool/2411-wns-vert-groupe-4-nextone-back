// service.service.ts

import DataSource from "../lib/datasource";
import { ServiceEntity } from "../entities/Service.entity";
import { Repository } from "typeorm";

export default class ServicesService {
  private db: Repository<ServiceEntity>;

  constructor() {
    this.db = DataSource.getRepository(ServiceEntity);
  }

  async getAllServices(): Promise<ServiceEntity[]> {
    return await this.db.find();
  }

  async getServiceById(id: string): Promise<ServiceEntity | null> {
    return await this.db.findOneBy({ id });
  }

  async createService(data: { name: string }): Promise<ServiceEntity> {
    const service = this.db.create(data);
    return await this.db.save(service);
  }

  async updateService(id: string, data: Partial<ServiceEntity>): Promise<ServiceEntity | null> {
    const service = await this.db.findOneBy({ id });
    if (!service) return null;
    Object.assign(service, data);
    return await this.db.save(service);
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await this.db.delete(id);
    return result.affected === 1;
  }
}
