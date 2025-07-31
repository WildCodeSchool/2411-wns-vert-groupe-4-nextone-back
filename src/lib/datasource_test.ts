import CompanyEntity from "@/entities/Company.entity";
import { DataSource } from "typeorm";
import TicketEntity from "@/entities/Ticket.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import AuthorizationEntity from "@/entities/Authorization.entity";
import ConnectionLogEntity from "@/entities/ConnectionLog.entity";
import SettingEntity from "@/entities/setting.entity";
import ManagerEntity from "@/entities/Manager.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import CounterEntity from "@/entities/Counter.entity";
import { TicketSubscriber } from "@/subscribers/ticket.subscriber";
import CompanySubscriber from "@/subscribers/company.subscriber";

export default new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5436,
  username: process.env.POSTGRES_USER || "utilisateur",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: "nextone-db-test",

  entities: [
    CompanyEntity,
    TicketEntity,
    ServiceEntity,
    AuthorizationEntity,
    SettingEntity,
    ManagerEntity,
    TicketLogEntity,
    ConnectionLogEntity,
    CounterEntity
  ],
  subscribers: [TicketSubscriber, CompanySubscriber],

  synchronize: true, // pas à utiliser en prod (faire des migrations pour la prod);

  logging: ["error"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
  // logging: ["error", "query"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
});
