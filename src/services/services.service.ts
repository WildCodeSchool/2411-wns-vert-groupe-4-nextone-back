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
    return this.db.find();
  }

  async getServiceById(id: string): Promise<ServiceEntity | null> {
    return this.db.findOneBy({ id });
  }

  async createService(data: MutationCreateServiceArgs["data"]): Promise<ServiceEntity> {
    const service = this.db.create(data);
    return this.db.save(service);
  }

  async updateService(id: string, data: MutationUpdateServiceArgs["data"]): Promise<ServiceEntity | null> {
    const existing = await this.getServiceById(id);
    if (!existing) return null;
    const updated = this.db.merge(existing, data);
    return this.db.save(updated);
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await this.db.delete(id);
    return result.affected === 1;
  }
  
  async findOne(options: any) {
    return this.db.findOne(options);
  }

  async getManagersByServiceId(serviceId: string) {
    const serviceWithManagers = await this.db.findOne({
      where: { id: serviceId },
      relations: ['managers'], 
    });
    if (!serviceWithManagers) {
      throw new Error('Service not found');
    }
    return serviceWithManagers.managers;
  }

  async getAllServicesWithManagers() {
    return await this.db.find({
      relations: ['managers'],
    });
  }
}
