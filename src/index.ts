import express, { Request, Response } from "express";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import http from "http";
import datasource from "./lib/datasource";
import "dotenv/config";
import depthLimit from "graphql-depth-limit";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import ManagerEntity from "./entities/Manager.entity";
import { authContext } from "./lib/authContext";

export interface MyContext {
  req: Request;
  res: Response;
  manager: ManagerEntity | null;
}

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)],
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function main() {
  await server.start();
  console.log("🚀 Apollo Server démarré sur /graphql");

  await datasource.initialize();
  console.log("📦 Base de données initialisée");

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({ credentials: true, origin: ["*"] }),
    express.json(),
    expressMiddleware(server, { context: authContext })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4005 }, resolve));
  console.log("✅ Serveur HTTP en écoute sur le port 4005");
}

main();
