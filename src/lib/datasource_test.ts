import { DataSource } from "typeorm";
import TicketEntity from "@/entities/Ticket.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import AuthorizationEntity  from "@/entities/Authorization.entity";

export default new DataSource({
  type: "sqlite",
  database: "./demo-test.sqlite",
  synchronize: true,
  entities: [TicketEntity, ServiceEntity,AuthorizationEntity],
  logging: ["query", "error"],
});