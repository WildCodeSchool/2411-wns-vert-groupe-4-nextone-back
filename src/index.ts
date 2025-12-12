import express, { Request, Response } from "express";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import "dotenv/config";
import depthLimit from "graphql-depth-limit";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import datasource from "./lib/datasource";
import ManagerEntity from "./entities/Manager.entity";
import { authContext } from "./lib/authContext";
import type { Loaders } from "./lib/dataLoaderContext";
import uploadImage from "./routes/uploadImage";
import { GraphQLResolveInfo } from "graphql";
import { createApollo4QueryValidationPlugin, constraintDirectiveTypeDefs } from "graphql-constraint-directive/apollo4"

export interface MyContext {
  req: Request;
  res: Response;
  manager: ManagerEntity | null;
  loaders: Loaders;
  ip: string | null | undefined;
}

export type ResolverFn<TArgs = {}> = (
  source: any,
  args: TArgs,
  context: MyContext,
  info: GraphQLResolveInfo,
) => any;


export type ResolverWrapper<TArgs = {}> = (
  next: ResolverFn<TArgs>,
) => ResolverFn<TArgs>;


const app = express();

uploadImage(app)

const httpServer = http.createServer(app);

const authorizedCorsUrls = [
  "http://localhost:4000",
  "https://david4.wns.wilders.dev",
  "https://staging.david4.wns.wilders.dev",
];

// MR
const schema = makeExecutableSchema({ typeDefs:[constraintDirectiveTypeDefs, typeDefs], resolvers });

const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const serverCleanup = useServer({ schema }, wsServer);

//New instance ApolloServer with (HTTP + WS)
const server = new ApolloServer<MyContext>({
  schema,
  validationRules: [depthLimit(5)],
  plugins: [
    createApollo4QueryValidationPlugin(),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});
// END MR

async function main() {
      await server.start();
  console.log("🚀 Apollo Server démarré sur /graphql");

  await datasource
    .initialize()
    .then(() => {
      console.log("📦 Base de données initialisée");
    })
    .catch((err) => {
      console.error("❌ Échec de la connexion à la base de données :", err);
    });

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      credentials: true,
      origin: authorizedCorsUrls,
    }),
    express.json(),
    expressMiddleware(server, { context: authContext })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4005 }, resolve)
  );
  console.log("✅ Serveur HTTP en écoute sur le port 4005");
  console.log(
    "🔌 Subscriptions WebSocket prêtes sur ws://localhost:4005/graphql"
  ); // MR
}

main();
