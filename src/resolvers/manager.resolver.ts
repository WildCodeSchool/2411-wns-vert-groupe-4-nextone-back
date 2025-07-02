import ManagerService from "@/services/manager.service";
import { MutationCreateManagerArgs, QueryLoginArgs, Message, QueryManagerArgs, MutationUpdateManagerArgs,
    MutationAssociateManagerAtServiceArgs, MutationDissociateManagerFromServiceArgs
} from "@/generated/graphql";
import { MyContext } from "..";
import Cookies from "cookies";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import ManagerEntity, { LoginInput, UpdateInput } from "@/entities/Manager.entity";
import ServicesService from "@/services/services.service";

//Le super_admin gère admin et operator, et admin gère un operator
function checkAuthorization(currentRole: string, targetRole?: string) {
  const allowedCreators = ["SUPER_ADMIN", "ADMIN"];
  if (!allowedCreators.includes(currentRole)) {
    throw new Error("Non autorisé : seuls les superAdmin ou admin ont des droits sur les operators.");
  }
  if (!targetRole) {
    throw new Error("Le rôle est requis.");
  }
  const roleHierarchy = {
    SUPER_ADMIN: ["ADMIN", "OPERATOR"],
    ADMIN: ["OPERATOR"]
  };
  const allowedRoles = roleHierarchy[currentRole as keyof typeof roleHierarchy];
  if (!allowedRoles.includes(targetRole)) {
    throw new Error("Non autorisé : vous ne pouvez pas gérer un utilisateur avec ce rôle.");
  }
}

export default {
    Query: {
        managers: async ( _: any,): Promise<ManagerEntity[]> => {
            return await new ManagerService().listManagers();
        },

        manager: async (_: any, { id }: QueryManagerArgs): Promise<ManagerEntity> => {
          const manager = await new ManagerService().getManagerById(id);
          return manager;
        },

        login: async (_: any, { infos }: QueryLoginArgs, ctx: MyContext) => {
            const { res } = ctx;
            if(ctx.manager !== null && ctx.manager.email !== infos.email) {
                throw new Error("Veuillez vous déconnecter");
            }
            const loginInfos = plainToInstance(LoginInput, infos);
            const errors = await validate(loginInfos);
            if (errors.length > 0) {
                const messages = errors.flatMap(err => Object.values(err.constraints || {}));
                throw new Error(messages.join(" | "));
            }
            const { manager, token } = await new ManagerService().login(infos);
            res.cookie("token", token, {
                httpOnly: true,
            });
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
            if (!manager) {
                throw new Error("Non autorisé : veuillez vous connecter.");
            }
            checkAuthorization(manager.role, infos.role);
            const managerExists = await new ManagerService().findManagerByEmail(infos.email);
            if (managerExists) {
                throw new Error("Cet email est déjà pris !");
            }
            const newManager = plainToInstance(ManagerEntity, infos);
            const errors = await validate(newManager);
            if (errors.length > 0) {
                const messages = errors.flatMap(err => Object.values(err.constraints || {}));
                throw new Error(messages.join(" | "));
            }
            return await new ManagerService().create({ ...infos });
        },

        deleteManager: async (_: any, { id }: QueryManagerArgs, { manager }: MyContext): Promise<Message> => {
            if (!manager) {
                throw new Error("Non autorisé : veuillez vous connecter.");
            }
            const targetManager = await new ManagerService().getManagerById(id);
            if (!targetManager) {
                return { content: "Manager introuvable", status: false };
            }
            checkAuthorization(manager.role, targetManager.role);
            const isManagerDeleted = await new ManagerService().deleteManager(id);
            if (!isManagerDeleted) {
                return { content: "Manager not found", status: false };
            }
            return { content: "Manager deleted", status: true };
        },

        updateManager: async (_: any, { id, data }: MutationUpdateManagerArgs, { manager }: MyContext): Promise<ManagerEntity> => {
            if (!manager) {
                throw new Error("Non autorisé : veuillez vous connecter.");
            }
            if (!id) {
                throw new Error("L'ID du manager à modifier est requis.");
            }
            if (!data || Object.keys(data).length === 0) {
                throw new Error("Aucune donnée à modifier.");
            }
            const targetManager = await new ManagerService().getManagerById(id);
            if (!targetManager) {
                throw new Error("Manager à modifier introuvable.");
            }
            checkAuthorization(manager.role, targetManager.role);
            const updatedManager = plainToInstance(UpdateInput, { ...targetManager, ...data }, { exposeDefaultValues: true });
            const errors = await validate(updatedManager, { skipMissingProperties: true });
            if (errors.length > 0) {
                const messages = errors.flatMap(err => Object.values(err.constraints || {}));
                throw new Error(messages.join(" | "));
            }
            return await new ManagerService().updateManager(id, data);
        },

       associateManagerAtService: async (_: any, { managerId, serviceId }: MutationAssociateManagerAtServiceArgs, { manager }: MyContext): Promise<Message> => {
            if (!manager) throw new Error("Non authentifié");
            const targetManager = await new ManagerService().findOne({
                where: { id: managerId },
                relations: ["services"],
            });
            const service = await new ServicesService().findOne({
                where: { id: serviceId },
                relations: ["managers"],
            });
            if (!targetManager || !service) {
                throw new Error("Manager ou service introuvable");
            }
            checkAuthorization(manager.role, targetManager.role);
            if (!targetManager.services.some((s) => s.id === service.id)) {
                targetManager.services.push(service);
            }
            await new ManagerService().save(targetManager);
            await new ServicesService().findOne({
                where: { id: service.id },
                relations: ["managers"],
            });
            return { content: "Manager associé du service spécifié", status: true };;
        },

        dissociateManagerFromService: async (_: any,{ managerId, serviceId }: { managerId: number; serviceId: number }, { manager }: MyContext): Promise<Message> => {
            if (!manager) throw new Error("Non authentifié");
            const targetManager = await new ManagerService().findOne({
                where: { id: managerId },
                relations: ["services"],
            });
            const serviceToRemove = await new ServicesService().findOne({
                where: { id: serviceId },
                relations: ["managers"],
            });
            if (!targetManager || !serviceToRemove) {
                return { content: "Manager ou service introuvable", status: false };
            }
            checkAuthorization(manager.role, targetManager.role);
            targetManager.services = targetManager.services.filter(
                (s) => s.id !== serviceToRemove.id
            );
            await new ManagerService().save(targetManager);
            return { content: "Manager dissocié du service spécifié", status: true };
        }
    },
};