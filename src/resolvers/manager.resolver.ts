import ManagerService from "@/services/manager.service";
import {
  MutationCreateManagerArgs,
  QueryLoginArgs,
  QueryManagerArgs,
  MutationUpdateManagerArgs,
  MutationToggleGlobalAccessManagerArgs,
  Message,
  Auth,
  MutationResetPasswordArgs,
  SortedManagers,
  Manager,
  MutationDeleteManagerArgs,
  // 👉 PAGINATION : Décommenter cet import pour activer la pagination
  // QueryManagersArgs,
} from "@/generated/graphql";
import { MyContext, ResolverWrapper } from "..";
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
import CompanyService from "@/services/company.service";

import { sendMail } from "@/lib/mail";
import InvitationService from "@/services/invitation.service";
import { GraphQLError } from "graphql";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";

const managerService = new ManagerService();

const managerResolver = {
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
      return managerService.listManagersFromCompany(manager.companyId);
    },
    SortedManagers: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<SortedManagers> => {
      const managers = await managerService.listManagersFromCompany(
        ctx.manager?.companyId!
      );
      const sorted: SortedManagers = {
        active: [],
        disable: [],
      };
      managers.forEach((m) => {
        if (m.isGloballyActive) {
          return sorted.active.push(m);
        }
        return sorted.disable.push(m);
      });
      return sorted;
    },

    // 👉 VERSION AVEC PAGINATION - Décommenter cette version et commenter celle du dessus
    // managers: async (
    //   _: any,
    //   { pagination }: QueryManagersArgs,
    //   ctx: MyContext
    // ): Promise<{ items: ManagerEntity[]; totalCount: number }> => {
    //   const { manager } = ctx;
    //   if (!manager) {
    //     throw new Error("Manager non authentifié");
    //   }
    //   verifyCreatorPermission(manager?.role);
    //   return managerService.listManagersPaginated(pagination);
    // },

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
      try {
        const loginInfos = plainToInstance(LoginInput, infos);
        await validateOrThrow(loginInfos);
        const { manager, token } = await managerService.login(infos);
        const { password, ...rest } = manager;
        ctx.res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000,
          path: "/",
        });
        return { manager: rest, token };
      } catch (error: any) {
        throw new GraphQLError(error?.message,{})
      }
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

    checkToken: async (_: any, __: any, ctx: MyContext) => {
      return ctx.manager
        ? {
            email: ctx.manager.email,
            id: ctx.manager.id,
            firstName: ctx.manager.firstName,
            lastName: ctx.manager.lastName,
            role: ctx.manager.role,
            profileImage: ctx.manager.profileImage,
            companyId: ctx.manager.companyId,
          }
        : null;
    },
  },
  Mutation: {
    createManager: async (
      _: any,
      { infos }: MutationCreateManagerArgs,
      { manager }: MyContext
    ): Promise<ManagerEntity> => {
      // if (!manager?.role) {
      //   throw new Error("Le rôle du manager est manquant.");
      // }
      // if (!infos.role) {
      //   throw new Error("Le rôle est requis.");
      // }
      // checkRoleInHierarchy(manager.role, infos.role);
      // const managerExists = await managerService.findManagerByEmail(
      //   infos.email
      // );
      // if (managerExists) {
      //   throw new Error("Cet email est déjà pris !");
      // }
      // const newManager = plainToInstance(ManagerEntity, infos);
      // await validateOrThrow(newManager);

      //LINVITATION EXISTE
      const invitations =
        await InvitationService.getInstance().findByProperties({
          email: infos.email,
          token: infos.invitationToken,
        });
      if (invitations.totalCount !== 1) {
        throw new GraphQLError("No invitation match.");
      }
      //ELLE EST ENCORE VALIDE
      const invit = invitations.items[0];
      const now = Date.now();
      if (now > new Date(invit.tokenExpiration).getTime()) {
        throw new GraphQLError(
          "The invitation expired. Please ask your N+1 for renew."
        );
      }

      return await managerService.create({
        ...infos,
        companyId: invit.companyId,
        role: invit.role,
      });
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
      const isManagerUpdatingSelf = manager.id === targetManager.id;
      if (!isManagerUpdatingSelf) {
        checkRoleInHierarchy(manager.role, targetManager.role);
      }
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
    askResetPassword: async (
      _: any,
      { email }: { email: string }
    ): Promise<Message> => {
      const token = await managerService.createResetToken(email);
      if (token) {
        sendMail(email, token, "RESET_PASSWORD");
      }
      return {
        success: !!token,
        message:
          "La demande a bien été traitée. Si un email correspondant a été trouvé, un email de récupération a été envoyé.",
      };
    },
    resetPassword: async (
      _: any,
      { args }: MutationResetPasswordArgs
    ): Promise<Message> => {
      const message: Message = await managerService.resetPassword(args);
      return message;
    },
  },
  Manager: {
    authorizations: async ({ id }: { id: string }) => {
      return await new AuthorizationService().getByManager(id);
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

const isManagerFromCompany =
  (): ResolverWrapper<
    | MutationUpdateManagerArgs
    | MutationDeleteManagerArgs
    | MutationToggleGlobalAccessManagerArgs
  > =>
  (next) =>
  async (root, args, context, info) => {
    await new ManagerService().checkManager(args.id, context.manager?.companyId!)
    next(root, args, context, info);
  };

const composition = {
  "Query.!{login,askResetPassword,resetPassword,checkToken}": [isAuthenticated()],
  "Mutation.{toggleGlobalAccessManager, deleteManager, updateManager}": [
    isAuthenticated(),
    isManagerFromCompany(),
  ],
};

export default composeResolvers(managerResolver, composition);
