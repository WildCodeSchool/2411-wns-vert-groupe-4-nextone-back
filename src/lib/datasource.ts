import { ServiceEntity } from "../entities/Service.entity";
import TicketEntity from "@/entities/Ticket.entity";
import CompanyEntity from "@/entities/Company.entity";
import AuthorizationEntity from "@/entities/Authorization.entity";
import { DataSource } from "typeorm";
import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
// import SettingEntity from "@/entities/setting.entity";

export default new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [TicketEntity, ServiceEntity, AuthorizationEntity, CompanyEntity,ConnectionLogEntity],
  logging: ["error", "query"],
});

