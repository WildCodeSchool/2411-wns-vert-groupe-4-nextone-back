// import express, { Request, Response } from "express";
// import "reflect-metadata";
// import { ApolloServer } from "@apollo/server";
// import http from "http";
// import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// import { makeExecutableSchema } from "@graphql-tools/schema";
// import { WebSocketServer } from "ws";
// import { useServer } from "graphql-ws/use/ws";
// import datasource from "./lib/datasource";
// import "dotenv/config";
// import depthLimit from "graphql-depth-limit";
// import cors from "cors";
// import { expressMiddleware } from "@apollo/server/express4";
// import typeDefs from "./typeDefs";
// import resolvers from "./resolvers";
// import ManagerEntity from "./entities/Manager.entity";
// import { authContext } from "./lib/authContext";
// import type { Loaders } from "./lib/dataLoaderContext";
// import nodemailer from "nodemailer";
// import { sendMail } from "./lib/mail";
// import path from "path";

// import { graphqlUploadExpress } from 'graphql-upload-minimal';

// export interface MyContext {
//   req: Request;
//   res: Response;
//   manager: ManagerEntity | null;
//   loaders: Loaders;
//   ip: string | null | undefined;
// }

// const app = express();

//   app.use('/public', express.static(path.join(process.cwd(), 'public'))); //<<<<
//   // app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));//<<<<
// const httpServer = http.createServer(app);

// const authorizedCorsUrls = [
//   "http://localhost:4000",
//   "https://david4.wns.wilders.dev",
//   "https://staging.david4.wns.wilders.dev",
// ];

// // MR
// const schema = makeExecutableSchema({ typeDefs, resolvers });

// const wsServer = new WebSocketServer({
//   server: httpServer,
//   path: "/graphql",
// });

// const serverCleanup = useServer({ schema }, wsServer);

// // const server = new ApolloServer<MyContext>({
// //   typeDefs,
// //   resolvers,
// //   validationRules: [depthLimit(5)],
// //   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// // });

// //New instance ApolloServer with (HTTP + WS)
// const server = new ApolloServer<MyContext>({
//   csrfPrevention: false, 
//   schema,
//   validationRules: [depthLimit(5)],
//   plugins: [
//     ApolloServerPluginDrainHttpServer({ httpServer }),
//     {
//       async serverWillStart() {
//         return {
//           async drainServer() {
//             await serverCleanup.dispose();
//           },
//         };
//       },
//     },
//   ],
// });
// // END MR

// async function main() {
//   await server.start();
//   console.log("🚀 Apollo Server démarré sur /graphql");

//   await datasource
//     .initialize()
//     .then(() => {
//       console.log("📦 Base de données initialisée");
//     })
//     .catch((err) => {
//       console.error("❌ Échec de la connexion à la base de données :", err);
//     });

//   app.use(
//     "/graphql",
//     cors<cors.CorsRequest>({
//       credentials: true,
//       origin: authorizedCorsUrls,
//     }),
//     graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
//     express.json(),
//     expressMiddleware(server, { context: authContext })
//   );

//   await new Promise<void>((resolve) =>
//     httpServer.listen({ port: 4005 }, resolve)
//   );
//   console.log("✅ Serveur HTTP en écoute sur le port 4005");
//   console.log(
//     "🔌 Subscriptions WebSocket prêtes sur ws://localhost:4005/graphql"
//   ); // MR

  
// }

// main();


import express, { Request, Response } from "express";
import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import http from "http";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import datasource from "./lib/datasource";
import "dotenv/config";
import depthLimit from "graphql-depth-limit";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import ManagerEntity from "./entities/Manager.entity";
import { authContext } from "./lib/authContext";
import type { Loaders } from "./lib/dataLoaderContext";
import path from "path";
import { graphqlUploadExpress } from "graphql-upload-minimal";

export interface MyContext {
  req: Request;
  res: Response;
  manager: ManagerEntity | null;
  loaders: Loaders;
  ip: string | null | undefined;
}

const app = express();

// Expose le dossier public pour les fichiers statiques
app.use('/public', express.static(path.join(process.cwd(), 'public')));

const httpServer = http.createServer(app);

const authorizedCorsUrls = [
  "http://localhost:4000",
  "https://david4.wns.wilders.dev",
  "https://staging.david4.wns.wilders.dev",
];

// Création du schema GraphQL
const schema = makeExecutableSchema({ typeDefs, resolvers });

// WebSocket pour subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});
const serverCleanup = useServer({ schema }, wsServer);

// Apollo Server HTTP
const server = new ApolloServer<MyContext>({
  schema,
  csrfPrevention: false, // essentiel pour upload
  validationRules: [depthLimit(5)],
  plugins: [
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

async function main() {
  await server.start();
  console.log("🚀 Apollo Server démarré sur /graphql");

  await datasource.initialize()
    .then(() => console.log("📦 Base de données initialisée"))
    .catch((err) => console.error("❌ Échec de la connexion à la base de données :", err));

  // Route GraphQL avec upload
  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      credentials: true,
      origin: authorizedCorsUrls,
    }),
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }), // ← avant Apollo
    expressMiddleware(server, { context: authContext }) // Apollo
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4005 }, resolve)
  );

  console.log("✅ Serveur HTTP en écoute sur le port 4005");
  console.log("🔌 Subscriptions WebSocket prêtes sur ws://localhost:4005/graphql");
}

main();
