import SettingEntity from "@/entities/setting.entity";
import { DeleteResponse, DeleteResponseSetting, MutationCreateServiceArgs, MutationUpdateSettingArgs, QuerySettingArgs, QuerySettingsArgs, QuerySettingsByPropertiesArgs, SettingsByPropertiesInput } from "@/generated/graphql";
import CompanyService from "@/services/company.service";
import SettingsSystemService from "@/services/setting.service";
import { buildResponse } from "@/utils/authorization";
import { MyContext } from "..";
import { FindOptionsWhere } from "typeorm";

const SettingService = SettingsSystemService.getService()

export default {
  Query: {
    settings: async (_: any, { pagination }: QuerySettingsArgs): Promise<SettingEntity[]> => {
      const settings = await SettingService.findAll(pagination)
      return settings
    },
    setting: async (_: any, args : { id: string}): Promise<SettingEntity | null> => {
      const setting = await SettingService.findById(args.id)
      return setting
    },
    settingsByProperties: async (_: any, { fields }: QuerySettingsByPropertiesArgs) => {
      const { pagination, ...rest } = fields
      // const mappedRest = Object.entries(rest).filter(([key, value]) => {
      //   return value !== undefined 
      // }) as FindOptionsWhere<SettingEntity>
      return await SettingService.findByProperties(rest, pagination)
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
  },
  Setting: {
    company: async (parent: SettingEntity,_: any, { loaders: { companyLoader }}: MyContext) => {
      return await companyLoader.load(parent.companyId)
    }
  }
} 