import assert from "assert";
import Ticket from "../src/entities/Ticket.entity";
import {
  IMockStore,
  Ref,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import TicketResolver from "../src/resolvers/ticket.resolver";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

const ticketTypeDefs = loadFilesSync(path.join(__dirname, "../src/typeDefs/ticket.gql"), {
  extensions: ["gql"],
});

export const LIST_TICKETS = `#graphql
    query Tickets {
        tickets {
            id
            code
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
  { id: "1", code: "001", firstName: "Corentin", lastName: "Tournier", email: "corentin.tournier@gmail.com", phone: "0606060606", status: "VALIDATED" },
  { id: "2", code: "002", firstName: "Marc", lastName: "Rogers", email: "marc.rogers@gmail.com", phone: "0706060606", status: "VALIDATED" },
];

let server: ApolloServer;

const schema = makeExecutableSchema({ typeDefs: ticketTypeDefs, resolvers: TicketResolver });

beforeAll(async () => {
  const store = createMockStore({ schema });
  const resolvers = (store: IMockStore) => ({
    Query: {
      tickets: () => {
        return store.get("Query", "ROOT", "tickets");
      },
    },
  });
  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      store,
      resolvers,
    }),
  });

  //remplissage du store
  store.set("Query", "ROOT", "tickets", ticketsData);
});

describe("Test sur les tickets", () => {
  it("Récupération des tickets depuis le store", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: LIST_TICKETS,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      tickets: [{ id: "1", code: "001" }, { id: "2", code: "002" }],
    });
  });
});