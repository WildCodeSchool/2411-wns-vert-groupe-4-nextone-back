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
import { GenerateTicketInput } from "../src/generated/graphql";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

const ticketTypeDefs = loadFilesSync(path.join(__dirname, "../src/typeDefs/ticket.gql"), {
  extensions: ["gql"],
});

export const LIST_TICKETS = `#graphql
    query getTickets {
      getTickets {
        id
        code
      }
    }
`;

export const GENERATE_TICKET = `#graphql
    mutation generateTicket($data: GenerateTicketInput!) {
      generateTicket(data: $data) {
        code
        id
        firstName
        lastName
        email
        phone
        status
      }
    }
`;

export const FIND_TICKET_BY_ID = `#graphql
    query getTicket($getTicketId: ID!) {
      getTicket(id: $getTicketId) {
        code
      }
    }
`;

type ResponseData = {
  tickets: Ticket[];
};

type ResponseDataCreate = {
  generateTicket: Ticket;
};

const ticketsData: Ticket[] = [
  { id: "1", code: "001", firstName: "Corentin", lastName: "Tournier", email: "corentin.tournier@gmail.com", phone: "0606060606", status: "VALIDATED" },
  { id: "2", code: "002", firstName: "Marc", lastName: "Rogers", email: "marc.rogers@gmail.com", phone: "0706060606", status: "VALIDATED" },
];

const generateTicketExample: Omit<Ticket, "id"> = {
  code: "003", firstName: "Ticket", lastName: "Test", email: "ticket.test@gmail.com", phone: "0606060607", status: "VALIDATED"
}

let server: ApolloServer;

const schema = makeExecutableSchema({ typeDefs: ticketTypeDefs, resolvers: TicketResolver });

beforeAll(async () => {
  const store = createMockStore({ schema });
  const resolvers = (store: IMockStore) => ({
    Query: {
      getTickets: () => {
        return store.get("Query", "ROOT", "getTickets");
      },
      getTicket: (_: any, { id }: { id: string }) => {
        return store.get("Ticket", id);
      }
    },
    Mutation: {
      generateTicket: (_: null, { data }: { data: GenerateTicketInput }) => {
        store.set("Ticket", "3", data);
        return store.get("Ticket", "3");
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
  store.set("Query", "ROOT", "getTickets", ticketsData);
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

  it("Création d'un ticket", async () => {
    const response = await server.executeOperation<ResponseDataCreate>({
      query: GENERATE_TICKET,
      variables: {
        data: {
          ...generateTicketExample,
        },
      },
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      createTicket: {
        id: "3",
        ...generateTicketExample,
      },
    });
  })

  it("Récupération d'un ticket par son id après l'ajout", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: FIND_TICKET_BY_ID,
      variables: { getTicketId: "3" },
    });
    
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      getTicket: { code: generateTicketExample.code },
    });
  })
});