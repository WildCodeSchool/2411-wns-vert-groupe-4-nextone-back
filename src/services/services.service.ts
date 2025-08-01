import { MutationCreateServiceArgs, MutationUpdateServiceArgs } from '@/generated/graphql';
import ServiceRepository from '@/repositories/Service.repository';
import { ServiceEntity } from '@/entities/Service.entity';

export default class ServicesService {
  db: ServiceRepository;

  constructor() {
    this.db = new ServiceRepository();
  }

  async getAllServices(): Promise<ServiceEntity[]> {
    return this.db.find(); 
  }

  async getServiceById(id: string): Promise<ServiceEntity | null> {
    return this.db.findOne({
      where: { id },
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

  async toggleGlobalAccess(service: ServiceEntity): Promise<boolean> {
    service.isGloballyActive = !service.isGloballyActive;
    await this.db.save(service);
    return service.isGloballyActive;
  }
}
