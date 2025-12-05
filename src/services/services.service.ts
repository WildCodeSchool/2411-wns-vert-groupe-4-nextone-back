import { CreateServiceInput, UpdateServiceInput } from "@/generated/graphql";
import ServiceRepository from "@/repositories/Service.repository";
import { ServiceEntity } from "@/entities/Service.entity";
import CompanyService from "./company.service";
import { pubsub } from "@/lib/pubsub";
import { EVENTS } from "@/subscriptions/events";
import { GraphQLAccountNumber } from "graphql-scalars";
import { GraphQLError } from "graphql/error";

export default class ServicesService {
  db: ServiceRepository;

  constructor() {
    this.db = new ServiceRepository();
  }

  async getAllServices(companyId: string): Promise<ServiceEntity[]> {
    const services = await this.db.find({
      where: {
        companyId,
      },
    });
    return services;
  }

  async getServiceById(id: string): Promise<ServiceEntity | null> {
    return this.db.findOne({
      where: { id },
    });
  }

  async createService(data: CreateServiceInput): Promise<ServiceEntity> {
    const company = await CompanyService.getService().findById(data.companyId);
    if (!company) {
      throw new Error("No Company with this id. Impossible to create service.");
    }
    const service = this.db.create({ ...data, company });
    return this.db.save(service);
  }

  async updateService(id: string, data: UpdateServiceInput): Promise<boolean> {
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
    const savedService = await this.db.save(service);
    await pubsub.publish(EVENTS.SERVICE_TOGGLED, {
      serviceToggled: savedService,
    });
    return service.isGloballyActive;
  }

  public async checkService(
    serviceId: string,
    companyId: string
  ): Promise<void> {
    const service = await this.db.findOne({
      where: {
        id: serviceId,
      },
    });
    if (!service) {
      return;
    }
    if (service.companyId !== companyId) {
      throw new GraphQLError("Forbidden.");
    }
  }
}
