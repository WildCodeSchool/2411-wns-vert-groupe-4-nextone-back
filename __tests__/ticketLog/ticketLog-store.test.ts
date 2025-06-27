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
  TICKETLOG,
  TICKETLOGS,
} from "../../src/queries/ticketlog.query";
import {
  MutationCreateTicketLogArgs,
  QueryTicketLogArgs,
  Status,
  TicketLog,
} from "../../src/generated/graphql";
import assert from "assert";

const fakeData: Partial<TicketLog>[] = [
  {
    id: "f6f368bf-1e98-49d8-92cb-2f2a2d9b33b8",
    status: Status.Created,
    managerId: "8402b7d8-dda6-40f3-9e10-ed2167642e5e",
    ticketId: "d7a67437-117c-4821-8af6-6112c07d8cf8",
  },
  {
    id: "f5dfa9d0-e5d9-4f9b-99aa-438c517c8390",
    status: Status.Created,
    managerId: "8402b7d8-dda6-40f3-9e10-ed2167642e5e",
    ticketId: "d7a67437-117c-4821-8af6-6112c07d8cf8",
  },
  {
    id: "2b43610f-8e88-4201-859e-928a3fb8cb73",
    status: Status.Created,
    managerId: "8402b7d8-dda6-40f3-9e10-ed2167642e5e",
    ticketId: "d7a67437-117c-4821-8af6-6112c07d8cf8",
  },
];

const fakeCreationData: TicketLog = {
  id: "d029957b-7cf2-4c8f-ae4d-ff748e190751",
  createdAt: "2025-06-25T14:28:03.726Z",
  status: Status.Pending,
  updatedAt: "2025-06-25T14:41:40.023Z",
  managerId: "8402b7d8-dda6-40f3-9e10-ed2167642e5e",
  ticketId: "d7a67437-117c-4821-8af6-6112c07d8cf8",
};

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
      const tickets = store.get('Query', "ROOT", 'ticketLogs')
      return tickets
    },
    ticketLog(_: any, { id }: { id: string}) {
      return store.get("TicketLog", id)
    }
  },
  Mutation: {
    createTicketLog(
      _: any,
      { data: { managerId, ticketId } }: MutationCreateTicketLogArgs
    ) {
      store.set("TicketLog", fakeCreationData.id, 
        fakeCreationData,
      );
      return fakeCreationData;
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
      ticketLogs: fakeData.map(f => ({ id: f.id})),
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
          managerId: fakeCreationData.managerId,
          ticketId: fakeCreationData.ticketId,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseCreate>({
      ticketLog: {id : fakeCreationData.id},
    });
  });
  //UPDATE

  //RECUPERATION
  it("RECUPERATION D'UN TICKETLOG", async () => {
    const response = await server.executeOperation<TResponseCreate, QueryTicketLogArgs>({
      query: TICKETLOG,
      variables: {
        id: fakeData[0].id
      }
    })

    assert(response.body.kind === "single")
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data).toEqual<TResponseCreate>({
      ticketLog: fakeData[0]
    })
  })

});
