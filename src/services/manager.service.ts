import ManagerRepository from "@/repositories/Manager.repository";
import { MutationRegisterArgs, QueryLoginArgs } from "@/generated/graphql";
import * as argon2 from "argon2";
import { SignJWT } from "jose";

export default class ManagerService {
    db: ManagerRepository;

    constructor() { 
        this.db = new ManagerRepository();
    }

    async listManagers() {
        return this.db.find();
    }

    async findManagerByEmail(email: string) {
        return await this.db.findOneBy({ email });
    }

    async create(manager : MutationRegisterArgs["infos"]) {
        const newManager = this.db.create({...manager});
        const savedManager = await this.db.save(newManager);
        return savedManager;
    }

    async login(infos: QueryLoginArgs["infos"]) {
        const manager = await this.findManagerByEmail(infos.email);
        if (!manager) {
            throw new Error("L'utilisateur n'est pas trouvé");
        }
        const isPasswordValid = await argon2.verify(manager.password, infos.password);
        if (!isPasswordValid) {
        throw new Error("Mot de passe incorrect.");
        }
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ id: manager.id, email: manager.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
        return { manager, token };
    }
}