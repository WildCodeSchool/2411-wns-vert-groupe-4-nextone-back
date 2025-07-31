import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import testDataSource from "../../src/lib/datasource_test";
import {
  CreateCompanyInput,
  DeleteResponse,
  GenerateTicketInput,
  InputRegister,
  ManagerRole,
  MutationCreateTicketLogArgs,
  MutationDeleteTicketLogArgs,
  MutationUpdateTicketLogArgs,
  QueryTicketLogArgs,
  Status,
  Ticket,
  TicketLog,
} from "../../src/generated/graphql";
import TicketService from "../../src/services/ticket.service";
import TicketEntity from "../../src/entities/Ticket.entity";
import ManagerEntity from "../../src/entities/Manager.entity";
import ManagerService from "../../src/services/manager.service";
import {
  CREATE_TICKETLOG,
  DELETE_TICKETLOG,
  TICKETLOG,
  UPDATE_TICKETLOG,
} from "../../src/queries/ticketlog.query";
import assert from "assert";
import { validate } from "uuid";
import CompanyEntity from "../../src/entities/Company.entity";
import TicketLogEntity from "../../src/entities/TicketLog.entity";
import CompanyService from "../../src/services/company.service";

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
};

const fakeCompany: CreateCompanyInput = {
  address: "Rue du chateau",
  email: "google@gmail.com",
  name: "Google",
  phone: "0404040404",
  siret: "362 521 879 00034",
  city: "TOULOUSE",
  postalCode: "31000",
};

const fakeManager: InputRegister = {
  password: "test",
  email: "jeanmichel@gmail.com",
  role: ManagerRole.Admin,
  firstName: "jean",
  lastName: "MICHEL",
  companyId: "",
};



beforeAll(async () => {
  server = new ApolloServer({
    schema,
  });


  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.synchronize(true);
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
  let baseCompanyId: string;

  it("CREATION D'UN TICKETLOG", async () => {
    //CREATION D'UNE COMPANY
    const newCompany: CompanyEntity =
      await CompanyService.getService().createOne(fakeCompany);
    baseCompanyId = newCompany.id;

    //CREATION D'UN TICKET
    const newTicket: TicketEntity =
      await TicketService.gettInstance().createOne(fakeTicket);
    baseTicketId = newTicket.id;

    //CREATION D'UN MANAGER
    fakeManager.companyId = baseCompanyId;
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
    const { id } = response.body.singleResult.data?.ticketLog!;
    baseId = id;
    expect(validate(id)).toBeTruthy();
  });

  it("UPDATE DU TICKET CREE", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationUpdateTicketLogArgs
    >({
      query: UPDATE_TICKETLOG,
      variables: {
        data: {
          id: baseId,
          status: Status.Done,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      ticketLog: {
        id: baseId,
        // manager: {
        //   ...fakeManager,
        //   id: baseManagerId,
        // },
        ticket: {
          id: baseTicketId,
        } as Ticket,
        status: Status.Done,
      },
    });
  });

  it("DELETE DU TICKET CREE", async () => {
    const response = await server.executeOperation<
      TResponseDelete,
      MutationDeleteTicketLogArgs
    >({
      query: DELETE_TICKETLOG,
      variables: {
        id: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseDelete>({
      message: {
        success: true,
        message: `Ticket log ${baseId} deleted.`,
      },
    });
  });

  it("RECUPERATION DU TICKET QUI N'EXISTE PLUS", async () => {
    const response = await server.executeOperation<null, QueryTicketLogArgs>({
      query: TICKETLOG,
      variables: {
        id: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      ticketLog: null,
    });
  });
});
