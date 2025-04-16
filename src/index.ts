import express from "express"
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import http from "http";
import datasource from "./lib/datasource";
import 'dotenv/config';

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

async function main() {
  await server.start();
  console.log("Apollo Server démarré");

  await datasource.initialize();


  app.listen(4000, () => {
    console.log("Le serveur est lancé sur le port 4000");
  });

  app.use(express.json());
}

main();

