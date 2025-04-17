import UserRepository from "@/repositories/Manager.repository";

export default class UserService {
    db: UserRepository;

    constructor() {
        this.db = new UserRepository();
    }

    async findUserByEmail(email: string) {
        return await this.db.findOneBy({ email });
    }

    async createUser({ email, password }: any) { //??
        const newUser = this.db.create({ email, password });
        return await this.db.save(newUser);
    }
}