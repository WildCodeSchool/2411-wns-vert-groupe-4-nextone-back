import ManagerRepository from "@/repositories/Manager.repository";
import { MutationCreateManagerArgs, QueryLoginArgs } from "@/generated/graphql";
import { SignJWT } from "jose";
import ManagerEntity from "@/entities/Manager.entity";
import CompanyService from "./company.service";
import crypto from "crypto"
import * as argon2 from 'argon2'

export default class ManagerService {
  db: ManagerRepository;

  constructor() {
    this.db = new ManagerRepository();
  }

  async listManagers() {
    const managers = await this.db.find();
    return managers;
  }

  async findManagerByEmail(email: string) {
    return await this.db.findOneBy({ email });
  }

  async findByIdWithAuthorizations(managerId: string) {
    return this.db.findOne({
    });
  }

  async getManagerById(id: string) {
    const manager = await this.db.findOne({ where: { id } });
    if (!manager) {
      throw new Error("No manager found");
    }
    return manager;
  }

  async create(manager: MutationCreateManagerArgs["infos"]) {
    const company = await CompanyService.getService().findById(
      manager.companyId
    );
    if (!company) {
      throw new Error(
        "Impossible to create manager : Company with this id not found."
      );
    }
    const newManager = this.db.create({ ...manager, company });
    const savedManager = await this.db.save(newManager);
    return savedManager;
  }

  async login(infos: QueryLoginArgs["infos"]) {
    const manager = await this.findManagerByEmail(infos.email);
    if (!manager) {
      throw new Error("L'utilisateur n'est pas trouvé");
    }
    const isPasswordValid = await argon2.verify(
      manager.password,
      infos.password
    );
    if (!isPasswordValid) {
      throw new Error("Mot de passe incorrect.");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ id: manager.id, email: manager.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);
    manager.isGloballyActive = true;
    return { manager, token };
  }

  async deleteManager(id: string) {
    const deletedManager = await this.db.delete(id);
    if (deletedManager.affected === 0) {
      return false;
    }
    return true;
  }

  async updateManager(
    id: string,
    data: Partial<Pick<ManagerEntity, "firstName" | "lastName" | "role">>
  ) {
    const managerFound = await this.getManagerById(id);
    const updatedManager = this.db.merge(managerFound, data);
    return await this.db.save(updatedManager);
  }

  async save(manager: ManagerEntity) {
    return this.db.save(manager);
  }

  async findOne(options: any) {
    return this.db.findOne(options);
  }

  async toggleGlobalAccess(manager: ManagerEntity): Promise<boolean> {
    manager.isGloballyActive = !manager.isGloballyActive;
    await this.db.save(manager);
    return manager.isGloballyActive;
  }

  async createResetToken(email: string): Promise<string | null> {

    const user = await this.findManagerByEmail(email)
    console.log("USER ; ", user, email)
    if (!user) return null

    const token = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiration = new Date(Date.now() + 15 * 60 * 1000)

    console.log('TOKEN : ', token, "RESET EXPIRATION : ", resetTokenExpiration)

    await this.db.save({ ...user, resetToken: token, resetTokenExpiration })
    
    return token
  }
}
