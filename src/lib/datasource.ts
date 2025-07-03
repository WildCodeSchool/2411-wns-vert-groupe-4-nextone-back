import { ServiceEntity } from "../entities/Service.entity";
import TicketEntity from "@/entities/Ticket.entity";
import CompanyEntity from "@/entities/Company.entity";
import AuthorizationEntity from "@/entities/Authorization.entity";
import { DataSource } from "typeorm";
import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import SettingEntity from "@/entities/setting.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { TicketSubscriber } from "@/subscribers/ticket.subscriber";
import CompanySubscriber from "@/subscribers/company.subscriber";

export default new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  logging: ["error", "query"],

  entities: [
    TicketEntity,
    ServiceEntity,
    AuthorizationEntity,
    CompanyEntity,
    SettingEntity,
    TicketLogEntity,
    ManagerEntity,
    ConnectionLogEntity
  ],
  subscribers:[TicketSubscriber, CompanySubscriber],
  logging: ["error"],
  synchronize: true,
});


