import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import {
  addMocksToSchema,
  createMockStore,
  IMockStore,
} from "@graphql-tools/mock";
import {
  CREATE_TICKETLOG,
  TICKETLOG_ID,
  TICKETLOGS,
} from "../../src/queries/ticketlog.query";
import {

  MutationCreateTicketLogArgs,
  QueryTicketLogArgs,

  TicketLog,
} from "../../src/generated/graphql";
import assert from "assert";
import { fakeTicketLog, fakeData } from "../../src/utils/dataTest";

type TResponse = {
  ticketLogs: Partial<TicketLog>[];
};

type TResponseCreate = {
  ticketLog: Partial<TicketLog>;
};

type TResponseDelete = {};

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });
const store = createMockStore({ schema });

store.set("Query", "ROOT", "ticketLogs", fakeData);

const fakeResolvers = (store: IMockStore) => ({
  Query: {
    ticketLogs() {
      const tickets = store.get("Query", "ROOT", "ticketLogs");
      return tickets;
    },
    ticketLog(_: any, { id }: { id: string }) {
      return store.get("TicketLog", id);
    },
  },
  Mutation: {
    createTicketLog(
      _: any,
      { data: { managerId, ticketId } }: MutationCreateTicketLogArgs
    ) {
      store.set("TicketLog", fakeTicketLog.id, fakeTicketLog);
      return fakeTicketLog;
    },
  },
});

beforeAll(async () => {
  server = new ApolloServer({
    schema: addMocksToSchema({ schema, store, resolvers: fakeResolvers }),
  });
});

describe("TEST DES TICKETLOGS DANS LE STORE", () => {
  //TOUT RECUPERER
  it("RECUPERATION DE TOUS LES TICKETLOGS DU STORE", async () => {
    const response = await server.executeOperation<TResponse>({
      query: TICKETLOGS,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      ticketLogs: fakeData.map((f) => ({ id: f.id })),
    });
  });

  //CREATION
  it("CREATION D'UN TICKET LOG DANS LE STORE", async () => {
    const response = await server.executeOperation<
      TResponseCreate,
      MutationCreateTicketLogArgs
    >({
      query: CREATE_TICKETLOG,
      variables: {
        data: {
          managerId: "ac609537-54ec-4327-83f6-007c1120e8cd",
          ticketId: fakeTicketLog.ticket.id,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseCreate>({
      ticketLog: { id: fakeTicketLog.id },
    });
  });
  //UPDATE

  //RECUPERATION
  it("RECUPERATION D'UN TICKETLOG", async () => {
    const response = await server.executeOperation<
      TResponseCreate,
      QueryTicketLogArgs
    >({
      query: TICKETLOG_ID,
      variables: {
        id: fakeData[0].id,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseCreate>({
      ticketLog: {id: fakeData[0].id},
    });
  });
});
