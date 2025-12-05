import { GraphQLError } from "graphql/error";
import BaseService from "./base.service";
import SettingEntity from "@/entities/setting.entity";

export default class SettingService extends BaseService<SettingEntity> {
  private static instance: SettingService | null = null;

  private constructor() {
    super(SettingEntity);
  }

  public static getService(): SettingService {
    if (!this.instance) {
      this.instance = new SettingService();
    }
    return this.instance;
  }

  public async checkSetting(settingId: string, companyId: string): Promise<void>{
    const setting = await this.repo.findOne({
      where:{
        id: settingId
      }
    })
    if (!setting) {
      return
    }
    if (setting.companyId !== companyId) {
      throw new GraphQLError("Forbidden.")
    }
  }
}
