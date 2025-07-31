// import { ServiceEntity } from "../entities/Service.entity";
// import TicketEntity from "@/entities/Ticket.entity";
// import CompanyEntity from "@/entities/Company.entity";
// import AuthorizationEntity from "@/entities/Authorization.entity";
// import { DataSource } from "typeorm";
// import SettingEntity from "@/entities/setting.entity";

// import TicketLogEntity from "@/entities/TicketLog.entity";
// import ManagerEntity from "@/entities/Manager.entity";
// import { TicketSubscriber } from "@/subscribers/ticket.subscriber";


// export default new DataSource({
//   type: "postgres",
//   host: "db",
//   port: 5432,
//   username: process.env.POSTGRES_USER,
//   password: process.env.POSTGRES_PASSWORD,
//   database: process.env.POSTGRES_DB,

//   entities: [
//     TicketEntity,
//     ServiceEntity,
//     AuthorizationEntity,
//     CompanyEntity,
//     SettingEntity,
//     TicketLogEntity,
//     ManagerEntity
//   ],
//   subscribers:[TicketSubscriber],
//   logging: ["error"],
//   synchronize: true,

// });



import ManagerEntity from "@/entities/Manager.entity";
import { DataSource } from "typeorm";
import { ServiceEntity } from "../entities/Service.entity";
import TicketEntity from "@/entities/Ticket.entity";
import CompanyEntity from "@/entities/Company.entity";
import AuthorizationEntity from "@/entities/Authorization.entity";
import SettingEntity from "@/entities/setting.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";

export default new DataSource({
  type: "postgres",
  database: "nextone",
  username: "postgres",
  password: "secret",
  // entities: ["/src/entities/*.entities.ts"],
  entities: [TicketEntity,
    ServiceEntity,
    AuthorizationEntity,
    CompanyEntity,
    SettingEntity,
    TicketLogEntity,
    ManagerEntity],
  synchronize: true, // pas à utiliser en prod (faire des migrations pour la prod);
  logging: false, // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
  // logging: ["error", "query"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
})


