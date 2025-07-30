import SettingEntity from "@/entities/setting.entity";
import { DeleteResponse, DeleteResponseSetting, MutationCreateServiceArgs, MutationUpdateSettingArgs } from "@/generated/graphql";
import SettingsSystemService from "@/services/setting.service";
import { buildResponse } from "@/utils/authorization";

const SettingService = SettingsSystemService.getService()

export default {
  Query: {
    settings: async (): Promise<SettingEntity[]> => {
      const settings = await SettingService.findAll()
      return settings
    },
    setting: async (_: any, args : { id: string}): Promise<SettingEntity | null> => {
      const setting = await SettingService.findById(args.id)
      return setting
    }
  },
  Mutation: {
    createSetting: async (_:any, args: MutationCreateServiceArgs): Promise<SettingEntity> => {
      const created = await SettingService.createOne(args.data)
      return created
    },
    deleteSetting: async (_: any, args: { id: string }): Promise<DeleteResponseSetting> => {
      const isDeleted = await SettingService.deleteOne(args.id)
      return buildResponse(isDeleted, "Le paramètre a été supprimé", "Le paramètre n'a pas été supprimé");
    },
    updateSetting: async (_: any, args: MutationUpdateSettingArgs): Promise<SettingEntity | null> => {
      const { id } = args.data;
      const updated = await SettingService.updateOne(id, args.data)
      return updated
    }
  }
} 