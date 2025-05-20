import SettingEntity from "@/entities/setting.entity";
import { MutationCreateOneSettingsArgs, MutationUpdateSettingArgs } from "@/generated/graphql";
import SettingsSystemService from "@/services/setting.service";

const SettingService = SettingsSystemService.getService()

export default {
  Query: {
    findAllSettings: async (): Promise<SettingEntity[]> => {
      console.log("ON EST DANS LE RESOLVER")
      const settings = await SettingService.findAll()
      return settings
    },
    findSettingsById: async (_: any, args : { id: string}): Promise<SettingEntity | null> => {
      const setting = await SettingService.findById(args.id)
      return setting
    }
  },
  Mutation: {
    createOneSettings: async (_:any, args: MutationCreateOneSettingsArgs): Promise<SettingEntity> => {
      const created = await SettingService.createOne(args.data)
      return created
    },
    deleteOneSetting: async (_: any, args: { id: string }): Promise<boolean> => {
      const isDeleted = await SettingService.deleteOne(args.id)
      return isDeleted
    },
    updateSetting: async (_: any, args: MutationUpdateSettingArgs): Promise<SettingEntity | null> => {
      const { id } = args.data;
      const updated = await SettingService.updateOne(id, args.data)
      return updated
    }
  }
}