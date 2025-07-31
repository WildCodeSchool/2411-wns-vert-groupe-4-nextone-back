import {
  MutationAddAuthorizationArgs,
  MutationDeleteAuthorizationArgs,
  MutationUpdateAuthorizationArgs,
} from "@/generated/graphql";
import AuthorizationRepository from "@/repositories/Authorization.repository";
import AuthorizationEntity from "@/entities/Authorization.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { checkRoleInHierarchy } from "@/utils/manager";
import ManagerService from "./manager.service";
import ServicesService from "./services.service";
import { ServiceEntity } from "@/entities/Service.entity";

const managerService = new ManagerService();
const servicesService = new ServicesService();

export default class AuthorizationService {
  private db: AuthorizationRepository;

  constructor() {
    this.db = new AuthorizationRepository();
  }

  async getByService(serviceId: string): Promise<AuthorizationEntity[]> {
    return this.db.find({
      where: { service: { id: serviceId } },
      relations: ["manager", "service"],
    });
  }

  async getByManager(managerId: string): Promise<AuthorizationEntity[]> {
    return this.db.find({
      where: { manager: { id: managerId } },
      relations: ["manager", "service"],
    });
  }

  async addAuthorization(input: MutationAddAuthorizationArgs["input"], manager: ManagerEntity): Promise<boolean> {
    const [targetManager, targetService] = await this.validateEntities(input.managerId, input.serviceId);
    if (!targetManager) throw new Error("Manager à modifier introuvable.");
    if (!manager?.role) {
      throw new Error("Le rôle du manager est manquant.");
    }
    checkRoleInHierarchy(manager.role, targetManager.role);
    const exists = await this.findAuthorization(input.managerId, input.serviceId);
    if (exists) return false;
    const newAuthorization = this.db.create({
      manager: targetManager,
      service: targetService,
    });
    await this.db.save(newAuthorization);
    return true;
  }

  async updateAuthorization(data: MutationUpdateAuthorizationArgs["input"], actor: ManagerEntity): Promise<boolean> {
    const [targetManager] = await this.validateEntities(data.managerId, data.serviceId);
    if (!targetManager) throw new Error("Manager à modifier introuvable.");
    if (!actor?.role) {
        throw new Error("Le rôle du manager est manquant.");
    }
    checkRoleInHierarchy(actor.role, targetManager.role);
    const result = await this.db.update(
      {
        service: { id: data.serviceId },
        manager: { id: data.managerId },
      },
      { isActive: data.isActive }
    );
    return result.affected === 1;
  }

  async deleteAuthorization(input: MutationDeleteAuthorizationArgs["input"], actor: ManagerEntity): Promise<boolean> {
    const existing = await this.findAuthorization(input.managerId, input.serviceId);
    if (!existing) return false;
    const [targetManager] = await this.validateEntities(input.managerId, input.serviceId);
    if (!targetManager) throw new Error("Manager à modifier introuvable.");
    if (!actor?.role) {
      throw new Error("Le rôle du manager est manquant.");
    }
    checkRoleInHierarchy(actor.role, targetManager.role);
    await this.db.remove(existing);
    return true;
  }

  private async findAuthorization(managerId: string, serviceId: string) {
    return this.db.findOne({
      where: {
        manager: { id: managerId },
        service: { id: serviceId },
      },
    });
  }

  private async validateEntities(managerId: string, serviceId: string): Promise<[ManagerEntity, ServiceEntity]> {
  const [manager, service] = await Promise.all([
    managerService.findOne({ where: { id: managerId } }),
    servicesService.findOne({ where: { id: serviceId } }),
  ]);
  if (!manager || !service) {
    throw new Error("Manager ou service introuvable");
  }
  return [manager, service];
}
}
