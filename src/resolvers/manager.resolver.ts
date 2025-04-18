import ManagerService from "@/services/manager.service";
import { MutationRegisterArgs } from "@/generated/graphql";
import { MyContext } from "..";
import ManagerEntity from "@/entities/Manager.entity";
  
export default {
    Query: {
        managers: async () => {
            return await new ManagerService().listManagers();
        },
    },
    Mutation: {
        register: async (_: any, { infos }: MutationRegisterArgs, ctx: MyContext): Promise<ManagerEntity> => {
            const manager = await new ManagerService().findManagerByEmail(infos.email);
            if (manager) {
                throw new Error("Cet email est déjà pris!");
            }
            const newManager = await new ManagerService().create({...infos});
            return newManager;
        },
    },
};