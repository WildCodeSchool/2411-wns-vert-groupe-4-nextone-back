//ON MOCK LA DB AVEC CELLE DE TEST
jest.mock("../../src/lib/datasource", () => {
  return {
    __esModule: true,
    default: jest.requireActual("../../src/lib/datasource_test").default,
  };
});
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import testDataSource from "../../src/lib/datasource_test";
import {
  DeleteResponse,
  MutationDeleteTicketLogArgs,
  QueryTicketLogArgs,
  QueryTicketLogsByPropertyArgs,
  Status,
  Ticket,
  TicketLog,
  UpdateStatusTicketInput,
} from "../../src/generated/graphql";
import TicketService from "../../src/services/ticket.service";
import TicketEntity from "../../src/entities/Ticket.entity";
import ManagerEntity from "../../src/entities/Manager.entity";
import ManagerService from "../../src/services/manager.service";
import {
  DELETE_TICKETLOG,
  TICKETLOG,
  TICKETLOG_BY_PROPERTY,
} from "../../src/queries/ticketlog.query";
import assert from "assert";
import { validate } from "uuid";
import CompanyEntity from "../../src/entities/Company.entity";
import CompanyService from "../../src/services/company.service";
import ServicesService from "../../src/services/services.service";
import {
  fakeCompanyInput,
  fakeManagerInput,
  fakeService,
  fakeServiceInput,
  fakeTicketInput,
} from "../../src/utils/dataTest";

type PartialTicketLog = Partial<Omit<TicketLog, "ticket">> & {
  ticket: Pick<Ticket, "id" | "firstName" | "lastName">;
};

type TResponse = {
  ticketLog: PartialTicketLog[] | null;
};

type TResponseDelete = {
  message: DeleteResponse;
};

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });

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
  let baseServiceId: string;

  it("CREATION D'UN TICKETLOG", async () => {

    //CREATION D'UNE COMPANY
    const newCompany: CompanyEntity =
      await CompanyService.getService().createOne(fakeCompanyInput);
    baseCompanyId = newCompany.id;

    //CREATION DU SERVICE
    const newService = await new ServicesService().createService(
      {...fakeServiceInput, companyId: baseCompanyId}

    );
    baseServiceId = newService.id

    //CREATION D'UN TICKET
    const newTicket: TicketEntity =
      await TicketService.gettInstance().createOne({...fakeTicketInput, service: newService});
    baseTicketId = newTicket.id;

    // //ET ENFIN, ON RECUPERE LE TICKETLOG QUI A ETE CREE VIA
    // LE SUBSCRIBER SUR TICKETENTITY👍
    const response = await server.executeOperation<
      TResponse,
      QueryTicketLogsByPropertyArgs
    >({
      query: TICKETLOG_BY_PROPERTY,
      variables: {
        field: {
          ticketId: baseTicketId,
        },
      },
    });
    assert(response.body.kind === "single");

    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).not.toBeNull();
    expect(response.body.singleResult.data).not.toBeUndefined();
    expect(response.body.singleResult.data?.ticketLog).toHaveLength(1);
    const { id, ...rest } = response.body.singleResult.data?.ticketLog![0]!;
    expect(validate(id)).toBeTruthy;
    baseId = id!;
    expect(rest).toEqual<PartialTicketLog>({
      ticket: {
        id: baseTicketId,
        firstName: fakeTicketInput.firstName,
        lastName: fakeTicketInput.lastName,
      },
      status: Status.Created,
    });
  });

  it("UPDATE DU TICKET CREE", async () => {
    //CREATION D'UN MANAGER POUR POUVOIR UPDATE LE TICKET
    fakeManagerInput.companyId = baseCompanyId;
    const newManager: ManagerEntity = await new ManagerService().create(
      fakeManagerInput
    );
    baseManagerId = newManager.id;

    //ON MET A JOUR LE TICKET
    const updateData: UpdateStatusTicketInput = {
      id: baseTicketId,
      status: Status.Pending,
    };
    await TicketService.gettInstance().updateTicketStatus(
      updateData,
      newManager
    );

    //ON RECUPERE LE TICKETLOG QUI A ETE CREE
    const response = await server.executeOperation<
      TResponse,
      QueryTicketLogsByPropertyArgs
    >({
      query: TICKETLOG_BY_PROPERTY,
      variables: {
        field: {
          ticketId: baseTicketId,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.ticketLog).toHaveLength(2);
    const { id, ...rest } = response.body.singleResult.data
      ?.ticketLog![0] as PartialTicketLog;
    expect(validate(id)).toBeTruthy();
    expect(rest).toEqual<PartialTicketLog>({
      ticket: {
        id: baseTicketId,
        firstName: fakeTicketInput.firstName,
        lastName: fakeTicketInput.lastName,
      },
      status: Status.Pending,
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
