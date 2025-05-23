import datasource from "../lib/datasource";
import { Repository } from "typeorm";
import SettingEntity from "@/entities/setting.entity";

export default class SettingsRepository extends Repository<SettingEntity> {
  constructor() {
    super(SettingEntity, datasource.createEntityManager());
  }
}
