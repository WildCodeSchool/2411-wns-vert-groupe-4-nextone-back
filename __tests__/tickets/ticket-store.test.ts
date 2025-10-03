import assert from "assert";
import {
  IMockStore,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import TicketResolver from "../../src/resolvers/ticket.resolver";
import {
  GenerateTicketInput,
  MutationGenerateTicketArgs,
  MutationUpdateTicketArgs,
  Status,
  Ticket,
} from "../../src/generated/graphql";
import {
  LIST_TICKETS,
  GENERATE_TICKET,
  FIND_TICKET_BY_ID,
  DELETE_TICKET,
  UPDATE_TICKET,
} from "../../src/queries/ticket.query";
import typeDefs from "../../src/typeDefs";
import { fakeService } from "../../src/utils/dataTest";

type ResponseData = {
  tickets: {
    items: Ticket[];
    totalCount: number;
  };  
};

type ResponseDataCreate = {
  generateTicket: Ticket;
};

const ticketsData: Ticket[] = [
  {
    id: "1",
    code: "001",
    firstName: "Corentin",
    lastName: "Tournier",
    email: "corentin.tournier@gmail.com",
    phone: "0606060606",
    status: Status.Pending,
    service: fakeService,
    ticketLogs: [],
  },
  {
    id: "2",
    code: "002",
    firstName: "Marc",
    lastName: "Rogers",
    email: "marc.rogers@gmail.com",
    phone: "0706060606",
    status: Status.Pending,
    service: fakeService,
    ticketLogs: [],
  },
];

const generateTicketExample: GenerateTicketInput = {
  firstName: "Ticket",
  lastName: "Test",
  email: "ticket.test@gmail.com",
  phone: "0606060607",
  serviceId: "8d106e86-5ffb-4e97-bb3a-cba9a329bbef",
};

let server: ApolloServer;

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: TicketResolver,
});

beforeAll(async () => {
  const store = createMockStore({ schema });
  const resolvers = (store: IMockStore) => ({
    Query: {
      tickets: () => {
    return store.get("Query", "ROOT", "tickets") || {
      items: ticketsData,
      totalCount: ticketsData.length,
    };
      },
      ticket: (_: any, { id }: { id: string }) => {
        return store.get("Ticket", id);
      },
    },
    Mutation: {
      generateTicket: (_: null, { data }: { data: GenerateTicketInput }) => {
        const { serviceId, ...rest } = data;
        store.set("Ticket", "3", { ...rest, ticketLogs: [], code: "003" });
        return store.get("Ticket", "3");
      },
      deleteTicket: (_: null, { id }: { id: string }) => {
        const ticketId = id;
        const ticket = store.get("Ticket", ticketId);
        if (!ticket) {
          return { message: "Ticket not found", success: false };
        }
        store.reset();
          store.set("Query", "ROOT", "tickets", {
          items: ticketsData,
          totalCount: ticketsData.length,
        });
        return { message: "Ticket deleted", success: true };
      },
      updateTicket: (_: null, args: MutationUpdateTicketArgs) => {
        const ticketId = args.data.id;
        const ticket = store.get("Ticket", ticketId);
        if (!ticket) {
          return { message: "Ticket not found", success: false };
        }
        store.set("Ticket", ticketId, { ...args.data });
        const item = store.get("Ticket", ticketId) as Ticket;
        return { ...item, ticketLogs: [] };
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
  store.set("Query", "ROOT", "tickets", {
    items: ticketsData,
    totalCount: ticketsData.length,
  });
});

describe("Test sur les tickets", () => {
  it("Récupération des tickets depuis le store", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: LIST_TICKETS,
      variables: {
        pagination: { limit: 2 },  
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      tickets: {
        items: [
          { id: "1", code: "001" },
          { id: "2", code: "002" },
        ],
        totalCount: 2,  
      },
    });
  });

  it("Création d'un ticket", async () => {
    const response = await server.executeOperation<
      ResponseDataCreate,
      MutationGenerateTicketArgs
    >({
      query: GENERATE_TICKET,
      variables: {
        data: {
          ...generateTicketExample,
        },
      },
    });

    assert(response.body.kind === "single");
    const { serviceId, ...rest } = generateTicketExample;
    expect(response.body.singleResult.data).toEqual({
      generateTicket: {
        id: "3",
        code: "003",
        ...rest,
      },
    });
  });

  it("Récupération d'un ticket après son ajout", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: FIND_TICKET_BY_ID,
      variables: { getTicketId: "3" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      ticket: { code: "003" },
    });
  });

  it("Suppression d'un ticket", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: DELETE_TICKET,
      variables: { deleteTicketId: "3" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      deleteTicket: { message: "Ticket deleted", success: true },
    });
  });

  it("Mise à jour d'un ticket", async () => {
    const { id, code, service, ticketLogs, ...ticketWithoutId } =
      ticketsData[0];

    const newTicketCode = "008";

    const response = await server.executeOperation<Ticket>({
      query: UPDATE_TICKET,
      variables: {
        data: {
          id: id,
          code: newTicketCode,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      updateTicket: {
        id: id,
        code: newTicketCode,
        ...ticketWithoutId,
      },
    });
  });
});
