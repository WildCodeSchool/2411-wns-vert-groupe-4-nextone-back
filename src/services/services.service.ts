// service.service.ts
import { MutationCreateServiceArgs, MutationUpdateServiceArgs } from '@/generated/graphql';
import ServiceRepository from '@/repositories/Service.repository';
import { ServiceEntity } from '@/entities/Service.entity';
import ManagerEntity from '@/entities/Manager.entity';

export default class ServicesService {
  db: ServiceRepository;

  constructor() {
    this.db = new ServiceRepository();
  }

  async getAllServices(): Promise<ServiceEntity[]> {
    return this.db.find({
      relations: ['managers'],
    });
  }

  async getServiceById(id: string): Promise<ServiceEntity | null> {
    return this.db.findOne({
      where: { id },
      relations: ['managers'],
    });
  }

  async createService(data: MutationCreateServiceArgs["data"]): Promise<ServiceEntity> {
    const service = this.db.create(data);
    return this.db.save(service);
  }

  async updateService(id: string, data: MutationUpdateServiceArgs["data"]): Promise<boolean> {
    const existing = await this.getServiceById(id);
    if (!existing) return false;
    const updated = this.db.merge(existing, data);
    await this.db.save(updated);
    return true;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await this.db.delete(id);
    return result.affected === 1;
  }
  
  async findOne(options: any) {
    return this.db.findOne(options);
  }

  async toggleGlobalAccess(service: ServiceEntity): Promise<ServiceEntity> {
    service.isGloballyActive = !service.isGloballyActive;
    return this.db.save(service);
  }
}
