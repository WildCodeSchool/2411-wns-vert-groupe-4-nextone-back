import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import testDataSource from "../../src/lib/datasource_test";
import { DeleteResponse, Status, Ticket, TicketLog, TicketStatus } from "../../src/generated/graphql";



let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers })

const fakeTicket: Omit<Ticket, "id"> = {
  code: "001",
  firstName: "Corentin",
  lastName: "Tournier",
  email: "corentin.tournier@gmail.com",
  phone: "0606060606",
  status: TicketStatus.Pending
}

const fakeManager = {
  password: 'test',
  email: 'jeanmichel@gmail.com',
  role: "SUPER_ADMIN",
  isGloballyActive: true,
}


beforeAll(async () => {
  server = new ApolloServer({
    schema,
  });
  
  //ON INITIALISE LA DB DE TEST
  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
      await testDataSource.query("TRUNCATE TABLE company CASCADE");
    }
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
  let baseTickerId: string;
  let baseManagerId: string;

  it("CREATION D'UN TICKETLOG", async () => {

  })
})