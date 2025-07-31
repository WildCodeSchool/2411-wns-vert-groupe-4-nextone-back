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
  Company,
  ManagerRole,
  ManagerWithoutPassword,
  MutationCreateTicketLogArgs,
  QueryTicketLogArgs,
  Service,
  Status,
  Ticket,
  TicketLog,
} from "../../src/generated/graphql";
import assert from "assert";



const fakeCompany: Company = {
  id: "f363fd0e-cb52-4089-bc25-75c72112d045",
  name: "Jambonneau CORPORATION",
  address: "38, Rue de la saucisse",
  postalCode: "31000",
  city: "TOULOUSE",
  siret: "362 521 879 00034",
  email: "jambo.no@gmail.com",
  phone: "0123456789",
  createdAt: "2025-07-04T10:46:23.954Z",
  updatedAt: "2025-07-04T10:46:23.954Z",
  services: [],
};

const fakeService: Service = {
  name: "Accueil",
  id: "aa953a24-7b28-4104-924a-d0dcda78131f",
  createdAt: "2025-07-04T10:46:24.023Z",
  updatedAt: "2025-07-04T10:46:24.023Z",
  company: fakeCompany,
  isGloballyActive: true
};

const fakeManager: ManagerWithoutPassword = {
  id: "1f50e0ca-ad6d-461d-b888-9d08c2ad6ff0",
  email: "michelito@gmail.com",
  firstName: "michel",
  lastName: "dedroite",
  role: ManagerRole.Operator,
  isGloballyActive: false,
  company: fakeCompany,
  authorizations: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

const fakeTickets: Ticket[] = [
  {
    id: "a78324f0-3f44-4f7e-943a-a09466def978",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Pending,
    service: fakeService,
  },
  {
    id: "00eec0d2-0082-4067-8e83-d13a47b55525",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Created,
    service: fakeService,
  },
  {
    id: "12a75dd6-c9af-403a-a537-b4634424c85d",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Done,
    service: fakeService,
  },
];

const fakeData: Partial<TicketLog>[] = [
  {
    id: "f6f368bf-1e98-49d8-92cb-2f2a2d9b33b8",
    status: Status.Created,
    manager: fakeManager,
    ticket: fakeTickets[0],
  },
  {
    id: "f5dfa9d0-e5d9-4f9b-99aa-438c517c8390",
    status: Status.Created,
    manager: fakeManager,
    ticket: fakeTickets[1],
  },
  {
    id: "2b43610f-8e88-4201-859e-928a3fb8cb73",
    status: Status.Created,
    manager: fakeManager,
    ticket: fakeTickets[0],
  },
];

const fakeCreationData: TicketLog = {
  id: "d029957b-7cf2-4c8f-ae4d-ff748e190751",
  createdAt: "2025-06-25T14:28:03.726Z",
  status: Status.Pending,
  updatedAt: "2025-06-25T14:41:40.023Z",
  manager: fakeManager,
  ticket: fakeTickets[0],
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
      store.set("TicketLog", fakeCreationData.id, fakeCreationData);
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
          managerId: fakeCreationData.manager?.id!,
          ticketId: fakeCreationData.ticket.id,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseCreate>({
      ticketLog: { id: fakeCreationData.id },
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
