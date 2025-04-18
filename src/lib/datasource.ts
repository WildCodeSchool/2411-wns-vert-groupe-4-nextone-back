import { ServiceEntity } from "../entities/Service.entity";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [ServiceEntity], // on peut mettre un tableau d'entité, ou un glob pour les récupérer toutes
  //entities: [],
  synchronize: true, // pas à utiliser en prod (faire des migrations pour la prod);
  logging: false, // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
  // logging: ["error", "query"], // nous permettra de voir les requêtes SQL qui sont jouées dans le terminal
});