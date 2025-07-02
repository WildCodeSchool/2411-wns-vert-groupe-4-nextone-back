import ManagerService from "@/services/manager.service";
import { MutationCreateManagerArgs, QueryLoginArgs, Message, QueryManagerArgs, MutationUpdateManagerArgs,
    MutationAssociateManagerAtServiceArgs, MutationDissociateManagerFromServiceArgs
} from "@/generated/graphql";
import { MyContext } from "..";
import Cookies from "cookies";
import { plainToInstance } from "class-transformer";
import ManagerEntity, { LoginInput, UpdateInput } from "@/entities/Manager.entity";
import ServicesService from "@/services/services.service";
import { validateOrThrow } from "@/utils/manager";
import { checkAuthorization } from "@/utils/manager";

const managerService = new ManagerService();
const servicesService = new ServicesService();

export default {
    Query: {
        managers: async ( _: any,): Promise<ManagerEntity[]> => {
            return managerService.listManagers();
        },

        manager: async (_: any, { id }: QueryManagerArgs): Promise<ManagerEntity>  => {
            return managerService.getManagerById(id);
        },

        login: async (_: any, { infos }: QueryLoginArgs, ctx: MyContext) => {
            if(ctx.manager && ctx.manager.email !== infos.email) {
                throw new Error("Veuillez vous déconnecter avant de vous reconnecter avec un autre compte");
            }
            const loginInfos = plainToInstance(LoginInput, infos);
            await validateOrThrow(loginInfos);
            const { manager, token } = await managerService.login(infos);
            ctx.res.cookie("token", token, { httpOnly: true });
            return { manager, token };
        },

        logout: async (_: any, __: any, ctx: MyContext): Promise<Message> => {
            const cookies = new Cookies(ctx.req, ctx.res);
            if (!ctx.manager) {
                return { content: "Vous avez déjà été déconnecté", status: false };
            }
            cookies.set("token");
            ctx.manager.is_globally_active = false
            return { content: "Vous êtes déconnecté", status: true };
        },
    },
    Mutation: {
        createManager: async (_: any, { infos }: MutationCreateManagerArgs, { manager }: MyContext): Promise<ManagerEntity> => {
            checkAuthorization(manager?.role, manager, infos.role);
            const managerExists = await managerService.findManagerByEmail(infos.email);
            if (managerExists) {
                throw new Error("Cet email est déjà pris !");
            }
            const newManager = plainToInstance(ManagerEntity, infos);
            await validateOrThrow(newManager);
            return await managerService.create(infos);
        },

        deleteManager: async (_: any, { id }: QueryManagerArgs, { manager }: MyContext): Promise<Message> => {
            const targetManager = await managerService.getManagerById(id);
            if (!targetManager) {
                return { content: "Manager introuvable", status: false };
            }
            checkAuthorization(manager?.role, manager, targetManager.role);
            const isManagerDeleted = await managerService.deleteManager(id);
            return isManagerDeleted
                ? { content: "Manager supprimé", status: true }
                : { content: "Suppression échouée", status: false };
        },

        updateManager: async (_: any, { id, data }: MutationUpdateManagerArgs, { manager }: MyContext): Promise<ManagerEntity> => {
            if (!id) throw new Error("L'ID du manager est requis.");
            if (!data || Object.keys(data).length === 0) throw new Error("Aucune donnée à modifier.");
            const targetManager = await managerService.getManagerById(id);
            if (!targetManager) throw new Error("Manager à modifier introuvable.");
            checkAuthorization(manager?.role, manager, targetManager.role);
            const updatedManager = plainToInstance(UpdateInput, { ...targetManager, ...data }, { exposeDefaultValues: true });
            await validateOrThrow(updatedManager);
            return managerService.updateManager(id, data);
        },

        associateManagerAtService: async (_: any, { managerId, serviceId }: MutationAssociateManagerAtServiceArgs, { manager }: MyContext): Promise<Message> => {
            const targetManager = await managerService.findOne({ where: { id: managerId }, relations: ["services"] });
            const service = await servicesService.findOne({ where: { id: serviceId }, relations: ["managers"] });
            if (!targetManager || !service) throw new Error("Manager ou service introuvable");
            checkAuthorization(manager?.role, manager, targetManager.role);
            if (!targetManager.services.some(s => s.id === service.id)) {
                targetManager.services.push(service);
                await managerService.save(targetManager);
            }
            return { content: "Manager associé au service", status: true };
        },

        dissociateManagerFromService: async (_: any, { managerId, serviceId }: MutationDissociateManagerFromServiceArgs, { manager }: MyContext): Promise<Message> => {
            const targetManager = await managerService.findOne({ where: { id: managerId }, relations: ["services"] });
            const service = await servicesService.findOne({ where: { id: serviceId }, relations: ["managers"] });
            if (!targetManager || !service) return { content: "Manager ou service introuvable", status: false };
            checkAuthorization(manager?.role, manager, targetManager.role);
            targetManager.services = targetManager.services.filter(s => s.id !== service.id);
            await managerService.save(targetManager);
            return { content: "Manager dissocié du service", status: true };
        },
    },
};
