import ManagerService from "@/services/manager.service";
import {
  MutationCreateManagerArgs,
  QueryLoginArgs,
  QueryManagerArgs,
  MutationUpdateManagerArgs,
  MutationToggleGlobalAccessManagerArgs,
  Message,
  Auth,
} from "@/generated/graphql";
import { MyContext } from "..";
import Cookies from "cookies";
import { plainToInstance } from "class-transformer";
import ManagerEntity, {
  LoginInput,
  UpdateInput,
} from "@/entities/Manager.entity";
import {
  checkRoleInHierarchy,
  checkStrictRole,
  validateOrThrow,
  verifyCreatorPermission,
} from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import AuthorizationService from "@/services/authorization.service";
import { ServiceEntity } from "@/entities/Service.entity";
import CompanyService from "@/services/company.service";
import ConnectionLogService from "@/services/connectionLog.service";
import TicketLogService from "@/services/ticketLogs.service";

const managerService = new ManagerService();

export default {
  Query: {
    managers: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<ManagerEntity[]> => {
      const { manager } = ctx;
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      verifyCreatorPermission(manager?.role);
      return managerService.listManagers();
    },

    manager: async (
      _: any,
      { id }: QueryManagerArgs
    ): Promise<ManagerEntity> => {
      return managerService.getManagerById(id);
    },

    login: async (
      _: any,
      { infos }: QueryLoginArgs,
      ctx: MyContext
    ): Promise<Auth> => {
      if (ctx.manager && ctx.manager.email !== infos.email) {
        throw new Error(
          "Veuillez vous déconnecter avant de vous reconnecter avec un autre compte"
        );
      }
      const loginInfos = plainToInstance(LoginInput, infos);
      await validateOrThrow(loginInfos);
      const { manager, token } = await managerService.login(infos);
      const { password, ...rest } = manager;
      ctx.res.cookie("token", token, { httpOnly: true });
      return { manager: rest, token };
    },

    logout: async (_: any, __: any, ctx: MyContext): Promise<Message> => {
      const cookies = new Cookies(ctx.req, ctx.res);
      if (!ctx.manager) {
        throw new Error("Vous avez déjà été déconnecté");
      }
      cookies.set("token");
      ctx.manager.isGloballyActive = false;
      return buildResponse(
        true,
        "Vous êtes déconnecté",
        "Vous n'êtes pas déconnecté"
      );
    },
  },
  Mutation: {
    createManager: async (
      _: any,
      { infos }: MutationCreateManagerArgs,
      { manager }: MyContext
    ): Promise<ManagerEntity> => {
      if (!manager?.role) {
        throw new Error("Le rôle du manager est manquant.");
      }
      if (!infos.role) {
        throw new Error("Le rôle est requis.");
      }
      checkRoleInHierarchy(manager.role, infos.role);
      const managerExists = await managerService.findManagerByEmail(
        infos.email
      );
      if (managerExists) {
        throw new Error("Cet email est déjà pris !");
      }
      const newManager = plainToInstance(ManagerEntity, infos);
      await validateOrThrow(newManager);
      return await managerService.create(infos);
    },

    deleteManager: async (
      _: any,
      { id }: QueryManagerArgs,
      { manager }: MyContext
    ): Promise<Message> => {
      const targetManager = await managerService.getManagerById(id);
      if (!targetManager) {
        throw new Error("Manager introuvable");
      }
      if (!manager?.role) {
        throw new Error("Le rôle du manager est manquant.");
      }
      checkRoleInHierarchy(manager.role, targetManager.role);
      const isManagerDeleted = await managerService.deleteManager(id);
      return buildResponse(
        isManagerDeleted,
        "Manager supprimé",
        "Suppression échouée"
      );
    },

    updateManager: async (
      _: any,
      { id, data }: MutationUpdateManagerArgs,
      { manager }: MyContext
    ): Promise<ManagerEntity> => {
      if (!id) throw new Error("L'ID du manager est requis.");
      if (!data || Object.keys(data).length === 0)
        throw new Error("Aucune donnée à modifier.");
      const targetManager = await managerService.getManagerById(id);
      if (!targetManager) throw new Error("Manager à modifier introuvable.");
      if (!manager?.role) {
        throw new Error("Le rôle du manager est manquant.");
      }
      checkRoleInHierarchy(manager.role, targetManager.role);
      const updatedManager = plainToInstance(
        UpdateInput,
        { ...targetManager, ...data },
        { exposeDefaultValues: true }
      );
      await validateOrThrow(updatedManager);
      return managerService.updateManager(id, data);
    },

    toggleGlobalAccessManager: async (
      _: any,
      { id }: MutationToggleGlobalAccessManagerArgs,
      ctx: MyContext
    ): Promise<Message> => {
      const { manager } = ctx;
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      checkStrictRole(manager?.role, "SUPER_ADMIN");
      const targetManager = await managerService.getManagerById(id);
      if (!targetManager) {
        throw new Error("Manager introuvable.");
      }
      const updatedManager = await managerService.toggleGlobalAccess(
        targetManager
      );
      return buildResponse(
        updatedManager,
        "Manager is active.",
        "Manager is not active."
      );
    },
  },
  Manager: {
    authorizations: async (
      { id }: { id: string },
      _: any,
      { loaders: { authByManagerIdLoader } }: MyContext
    ) => {
      return await authByManagerIdLoader.load(id);
    },
    company: async (manager: ManagerEntity) => {
      return await CompanyService.getService().findById(manager.companyId);
    },
    connectionLogs: async (
      { id }: { id: string },
      _: any,
      { loaders: { connectionLogByManagerIdLoader } }: MyContext
    ) => {
      return await connectionLogByManagerIdLoader.load(id);
    },
    ticketLogs: async (
      { id }: { id: string },
      _: any,
      { loaders: { ticketLogsByManagerIdLoader } }: MyContext
    ) => {
      return await ticketLogsByManagerIdLoader.load(id);
    },
  },
};
