import { DataSource } from "typeorm";
import TicketEntity from "@/entities/Ticket.entity";

export default new DataSource({
  type: "sqlite",
  database: "./demo-test.sqlite",
  synchronize: true,
  entities: [TicketEntity],
  logging: ["query", "error"],
});