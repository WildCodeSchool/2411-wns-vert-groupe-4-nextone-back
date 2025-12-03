import SettingEntity from "@/entities/setting.entity";
import {
  DeleteResponseSetting,
  MutationCreateServiceArgs,
  MutationDeleteSettingArgs,
  MutationUpdateSettingArgs,
  QuerySettingsArgs,
  QuerySettingsByPropertiesArgs,
  SettingsByPropertiesInput,
} from "@/generated/graphql";
import CompanyService from "@/services/company.service";
import SettingsSystemService from "@/services/setting.service";
import { buildResponse } from "@/utils/authorization";
import { MyContext, ResolverWrapper } from "..";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { GraphQLError } from "graphql";

const SettingService = SettingsSystemService.getService();

const settingResolver = {
  Query: {
    settings: async (
      _: any,
      { pagination }: QuerySettingsArgs,
      ctx: MyContext
    ): Promise<SettingEntity[]> => {
      const settings = await SettingService.findAll(pagination);
      return settings;
    },
    setting: async (
      _: any,
      args: { id: string }
    ): Promise<SettingEntity | null> => {
      const setting = await SettingService.findById(args.id);
      return setting;
    },
    settingsByProperties: async (
      _: any,
      { fields }: QuerySettingsByPropertiesArgs,
      ctx: MyContext
    ) => {
      const { pagination, ...rest } = fields;
      if (rest.companyId && rest.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden");
      }
      rest.companyId = ctx.manager?.companyId!;
      return await SettingService.findByProperties(rest, pagination);
    },
  },
  Mutation: {
    createSetting: async (
      _: any,
      args: MutationCreateServiceArgs,
      ctx: MyContext
    ): Promise<SettingEntity> => {
      if (args.data.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden");
      }
      const created = await SettingService.createOne(args.data);
      return created;
    },
    deleteSetting: async (
      _: any,
      args: MutationDeleteSettingArgs
    ): Promise<DeleteResponseSetting> => {
      const isDeleted = await SettingService.deleteOne(args.id);
      return buildResponse(
        isDeleted,
        "Le paramètre a été supprimé",
        "Le paramètre n'a pas été supprimé"
      );
    },
    updateSetting: async (
      _: any,
      args: MutationUpdateSettingArgs,
      ctx: MyContext
    ): Promise<SettingEntity | null> => {
      const { id } = args.data;
      const service = await SettingService.findById(id);
      if (!service || service.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.");
      }
      const updated = await SettingService.updateOne(id, args.data);
      return updated;
    },
  },
  Setting: {
    company: async (parent: SettingEntity) => {
      return await CompanyService.getService().findByProperties({
        settings: {
          companyId: parent.id,
        },
      });
    },
  },
};

const isSettingFromCompany =
  (): ResolverWrapper<{ id: string }> =>
  (next) =>
    async (root, args, context, info) => {
    await SettingService.checkSetting(args.id, context?.manager?.companyId!)
    return next(root, args, context, info);
  };
const composition = {
  "*.*": [isAuthenticated()],
  "Mutation.deleteSetting": [isSettingFromCompany()],
  "Query.setting": [isSettingFromCompany()],
};

export default composeResolvers(settingResolver, composition);
