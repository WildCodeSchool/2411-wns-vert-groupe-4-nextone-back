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
}
