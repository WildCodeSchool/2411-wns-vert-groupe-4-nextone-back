import CompanyEntity from "@/entities/Company.entity";
import { DataSource } from "typeorm";
import TicketEntity from "@/entities/Ticket.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import AuthorizationEntity from "@/entities/Authorization.entity";

import SettingEntity from "@/entities/setting.entity";
import ManagerEntity from "@/entities/Manager.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import { TicketSubscriber } from "@/subscribers/ticket.subscriber";

export default new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5436,
  username: process.env.POSTGRES_USER || "utilisateur",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: "nextone-db-test",

  entities: [
    TicketEntity,
    CompanyEntity,
    ServiceEntity,
    AuthorizationEntity,
    SettingEntity,
    ManagerEntity,
    TicketLogEntity,
  ],
  subscribers: [TicketSubscriber],
  synchronize: true, // pas à utiliser en prod (faire des migrations pour la prod);
  logging: ["error"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
  // logging: ["error", "query"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
});