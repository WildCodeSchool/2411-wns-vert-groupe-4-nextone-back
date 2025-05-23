import ManagerService from "@/services/manager.service";
import { MutationRegisterArgs, QueryLoginArgs, Message, QueryManagerArgs, MutationUpdateManagerArgs } from "@/generated/graphql";
import { MyContext } from "..";
import Cookies from "cookies";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import ManagerEntity, { LoginInput, UpdateInput } from "@/entities/Manager.entity";

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
            return { content: "Vous êtes déconnecté", status: true };
        },
    },
    Mutation: {  
        register: async (_: any, { infos }: MutationRegisterArgs, ctx: MyContext): Promise<ManagerEntity> => {
            const managerExists = await new ManagerService().findManagerByEmail(infos.email);
            if (managerExists) {
                throw new Error("Cet email est déjà pris!");
            }
            const newManager = plainToInstance(ManagerEntity, infos);
            const errors = await validate(newManager);
            if (errors.length > 0) {
                const messages = errors.flatMap(err => Object.values(err.constraints || {}));
                throw new Error(messages.join(" | "));
            }
            return await new ManagerService().create({ ...infos });
        },

        deleteManager: async (_: any, { id }: QueryManagerArgs, ctx: MyContext): Promise<Message> => {
            const isManagerDeleted = await new ManagerService().deleteManager(id);
            if(!isManagerDeleted) {
            return { content: "Manager not found", status: isManagerDeleted };
            }
            return { content: "Manager deleted", status: isManagerDeleted };
        },

        updateManager: async (_: any, { data }: MutationUpdateManagerArgs, ctx: MyContext): Promise<ManagerEntity> => {
        if (!ctx.manager) {
            throw new Error("Non autorisé");
        }
        if (!data || Object.keys(data).length === 0) {
            throw new Error("Vous modifiez aucune donnée");
        }
        const updatedManager = plainToInstance(UpdateInput, { ...ctx.manager, ...data }, { exposeDefaultValues: true });
        const errors = await validate(updatedManager, { skipMissingProperties: true });
        if (errors.length > 0) {
            const messages = errors.flatMap(err => Object.values(err.constraints || {}));
            throw new Error(messages.join(" | "));
        }
        return await new ManagerService().updateManager(ctx.manager.id, data);
        }
    },
};