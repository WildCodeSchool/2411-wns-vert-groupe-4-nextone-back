import express from "express"
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import http from "http";
import datasource from "./lib/datasource";
import 'dotenv/config';
import depthLimit from "graphql-depth-limit";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";

export interface MyContext {}

const app = express();
const httpServer = http.createServer(app);

const typeDefs = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello, world!",
  },
};

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)], //n+1
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function main() {

  await server.start();
  console.log("Apollo Server démarré");

  await datasource.initialize();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server),
  )

  await new Promise<void>(resolve => httpServer.listen({ port: 4005 }, resolve));
}

main();