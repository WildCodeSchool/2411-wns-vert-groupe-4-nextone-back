import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import testDataSource from "../../src/lib/datasource_test";
import {
  DeleteResponse,
  GenerateTicketInput,
  InputRegister,

  ManagerRole,

  MutationCreateTicketLogArgs,

  MutationDeleteTicketLogArgs,

  MutationUpdateTicketLogArgs,

  QueryTicketLogArgs,

  Status,

  TicketLog,
  TicketStatus,
  UpdateTicketLogInput,
} from "../../src/generated/graphql";
import TicketService from "../../src/services/ticket.service";
import TicketEntity from "../../src/entities/Ticket.entity";
import ManagerEntity from "../../src/entities/Manager.entity";
import ManagerService from "../../src/services/manager.service";
import { CREATE_TICKETLOG, DELETE_TICKETLOG, TICKETLOG, UPDATE_TICKETLOG } from "../../src/queries/ticketlog.query";
import assert from "assert";
import { validate } from "uuid";

type TResponse = {
  ticketLog: Partial<TicketLog> | null;
};

type TResponseDelete = {
  message: DeleteResponse;
};

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });

const fakeTicket: GenerateTicketInput = {
  code: "001",
  firstName: "Corentin",
  lastName: "Tournier",
  email: "corentin.tournier@gmail.com",
  phone: "0606060606",
  status: TicketStatus.Pending,
};

const fakeManager: InputRegister = {
  password: "test",
  email: "jeanmichel@gmail.com",
  role: ManagerRole.SuperAdmin,
  first_name: "jean",
  last_name: "MICHEL",
};

const fakeTicketLog: Partial<TicketLog> = {
  id: "",
  managerId: "",
  status: Status.Created,
  ticketId: "",
}

beforeAll(async () => {
  server = new ApolloServer({
    schema,
  });

  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.query("TRUNCATE TABLE ticketlog, tickets, managers CASCADE");
  } catch (error) {
    console.error("Error initializing test database:", error);
    throw error;
  }
});

//ON MOCK LA DB AVEC CELLE DE TEST
jest.mock("../../src/lib/datasource", () => {
  return {
    __esModule: true,
    default: jest.requireActual("../../src/lib/datasource_test").default,
  };
});

afterAll(async () => {
  //ON VIDE LA DB DE TEST
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
  jest.clearAllMocks();
});

describe("TEST TICKETLOG DANS LA DB", () => {
  let baseId: string;
  let baseTicketId: string;
  let baseManagerId: string;

  it("CREATION D'UN TICKETLOG", async () => {

    //CREATION D'UN TICKET
    const newTicket: TicketEntity = await new TicketService().generateTicket(
      fakeTicket
    );
    baseTicketId = newTicket.id;

    //CREATION D'UN MANAGER
    const newManager: ManagerEntity = await new ManagerService().create(
      fakeManager
    );
    baseManagerId = newManager.id;

    //ET ENFIN, CREATION D'UN TICKETLOG 👍
    const response = await server.executeOperation<
      TResponse,
      MutationCreateTicketLogArgs
    >({
      query: CREATE_TICKETLOG,
      variables: {
        data: {
          managerId: baseManagerId,
          ticketId: baseTicketId,
        },
      },
    });
    
    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).not.toBeNull();
    const { id, ...rest } = response.body.singleResult.data?.ticketLog!;
    baseId = id;
    expect(validate(id)).toBeTruthy();

  });

  it("UPDATE DU TICKET CREE", async () => {
    const response = await server.executeOperation<TResponse, MutationUpdateTicketLogArgs>({
      query: UPDATE_TICKETLOG,
      variables: {
        data: {
          id: baseId,
          status: Status.Done
          
        }
      }
    })

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      ticketLog: {
        id: baseId,
        managerId: baseManagerId,
        ticketId: baseTicketId,
        status: Status.Done
      }
    });

  })

  it('DELETE DU TICKET CREE', async () => {
    const response = await server.executeOperation<TResponseDelete, MutationDeleteTicketLogArgs>({
      query: DELETE_TICKETLOG,
      variables: {
        id: baseId
      }
    })

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseDelete>({
      message: {
        success: true,
        content: `Ticket log ${baseId} deleted.`
      }
    });
  })

  it("RECUPERATION DU TICKET QUI N'EXISTE PLUS", async () => {
    const response = await server.executeOperation<null, QueryTicketLogArgs>({
      query: TICKETLOG,
      variables: {
        id: baseId
      }
    })

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      ticketLog: null
    })
  })
});
