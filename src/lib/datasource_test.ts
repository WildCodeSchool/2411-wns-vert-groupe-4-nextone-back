import CompanyEntity from "@/entities/Company.entity";
import { DataSource } from "typeorm";
import TicketEntity from "@/entities/Ticket.entity";
// import SettingEntity from "@/entities/setting.entity";

export default new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5436,
  username: process.env.POSTGRES_USER || "utilisateur",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: "nextone-db-test",
  entities: [TicketEntity, CompanyEntity],
  synchronize: true, // pas à utiliser en prod (faire des migrations pour la prod);
  logging: ["error"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
  // logging: ["error", "query"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
});
