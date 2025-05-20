import ManagerRepository from "@/repositories/Manager.repository";
import { MutationRegisterArgs } from "@/generated/graphql";

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
}