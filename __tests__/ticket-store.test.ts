import assert from "assert";
import Ticket from "../src/entities/Ticket.entity";
import TicketResolver from "../src/resolvers/ticket.resolver";
import {
  IMockStore,
  Ref,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { buildSchemaSync } from "type-graphql";
import { printSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";

export const LIST_TICKETS = `#graphql
    query Tickets {
        tickets {
            id
            title
        }
    }
`;

type ResponseData = {
  tickets: Ticket[];
};

type ResponseDataCreate = {
  createTicket: Ticket;
};

const ticketsData: Ticket[] = [
  { id: "1", code: "001", firstName: "Corentin", lastName: "Tournier", email: "corentin.tournier@gmail.com", phone: "0606060606", status: "VALIDATED", serviceId: "1" },
  { id: "2", code: "002", firstName: "Marc", lastName: "Rogers", email: "marc.rogers@gmail.com", phone: "0706060606", status: "VALIDATED", serviceId: "1" },
];

let server: ApolloServer;

const baseSchema = buildSchemaSync({
  resolvers: [TicketResolver],
  authChecker: () => true,
});

const schemaString = printSchema(baseSchema);
const schema = makeExecutableSchema({ typeDefs: schemaString });

beforeAll(async () => {
  const store = createMockStore({ schema });
  const resolvers = (store: IMockStore) => ({
    Query: {
      books() {
        return store.get("Query", "ROOT", "books");
      },
    },
  });
  server = new ApolloServer({
    schema: addMocksToSchema({
      schema: baseSchema,
      store,
      resolvers,
    }),
  });

  //remplissage du store
  store.set("Query", "ROOT", "tickets", ticketsData);
});

describe("Test sur les livres", () => {
  it("Récupération des livres depuis le store", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: LIST_BOOKS,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      books: [{ id: "1" }, { id: "2" }],
    });
  });
});