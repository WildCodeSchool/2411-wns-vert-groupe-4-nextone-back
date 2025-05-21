import { MutationAddAuthorizationArgs, MutationUpdateAuthorizationArgs } from "@/generated/graphql";
import AuthorizationRepository from "@/repositories/Authorization.repository";
import AuthorizationEntity from "@/entities/Authorization.entity";

export default class AuthorizationService {
  db: AuthorizationRepository;

  constructor() {
    this.db = new AuthorizationRepository();
  }

  async getByService(serviceId: string): Promise<AuthorizationEntity[]> {
    return await this.db.find({ where: { serviceId } });
  }

  async getByManager(managerId: string): Promise<AuthorizationEntity[]> {
    return await this.db.find({ where: { managerId } });
  }

  async addAuthorization(data: MutationAddAuthorizationArgs["input"]): Promise<boolean> {
    const newAuth = this.db.create({ ...data, isActive: true });
    await this.db.save(newAuth);
    return true;
  }

  async updateAuthorization(data: MutationUpdateAuthorizationArgs["input"]): Promise<boolean> {
    const { serviceId, managerId, isActive } = data;
    const result = await this.db.update({ serviceId, managerId }, { isActive });
    return result.affected === 1;
  }

  async deleteAuthorization(serviceId: string, managerId: string): Promise<boolean> {
    const result = await this.db.delete({ serviceId, managerId });
    return result.affected === 1;
  }
}
