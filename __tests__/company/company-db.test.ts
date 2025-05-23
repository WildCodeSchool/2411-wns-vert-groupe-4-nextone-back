import { ApolloServer } from "@apollo/server";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import testDataSource from "../../src/lib/datasource_test";
import {
  COMPANIES,
  COMPANY_BY_ID,
  CREATE_COMPANY_DB,
  DELETE_COMPANY,
  UPDATE_COMPANY_DB,
} from "../../src/queries/query";
import assert from "assert";
import {
  Company,
  CreateCompanyInput,
  MutationCreateCompanyArgs,
  MutationUpdateCompanyArgs,
  DeleteResponseCompany,
  MutationDeleteCompanyArgs,
  QueryCompanyArgs,
} from "../../src/generated/graphql";
import { validate } from "uuid";

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });

const fakeCompanyData: CreateCompanyInput = {
  address: "Rue du chateau",
  email: "google@gmail.com",
  name: "Google",
  phone: "0404040404",
  siret: "362 521 879 00034",
};

const fakeCompanyDataUpdate: CreateCompanyInput = {
  address: "Rue du jambon UP",
  email: "jambonneauUPDATE@gmail.com",
  name: "JambonCorp",
  phone: "0123456789",
  siret: "362 521 879 00089",
};

//ON MOCK LA DB AVEC CELLE DE TEST
jest.mock("../../src/lib/datasource", () => {
  return {
    __esModule: true,
    default: jest.requireActual("../../src/lib/datasource_test").default,
  };
});

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

afterAll(async () => {
  //ON VIDE LA DB DE TEST
  if (testDataSource.isInitialized) {

    await testDataSource.destroy();
  }
  jest.clearAllMocks();
});


type TResponse = {
  company: Company;
};

type TResponseDelete = {
  message: DeleteResponseCompany;
};

type TResponseALL = {
  companies: Company[];
};

describe("TEST COMPANY AVEC DB", () => {
  let baseId: string;

  it("CREATION D'UNE COMPANY", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationCreateCompanyArgs
    >({
      query: CREATE_COMPANY_DB,
      variables: {
        data: fakeCompanyData,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).not.toBeNull();
    const { id, ...rest } = response.body.singleResult.data?.company!;
    baseId = id;
    expect(validate(id)).toBeTruthy();
    expect(rest).toEqual({
      ...fakeCompanyData,
    });
  });

  it("UPDATE DE LA COMPANY", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationUpdateCompanyArgs
    >({
      query: UPDATE_COMPANY_DB,
      variables: {
        data: { ...fakeCompanyDataUpdate, id: baseId },
      },
    },
    {
      contextValue: {
        manager: { role: "SUPER_ADMIN" },
      },
    }
  );

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      company: {
        ...fakeCompanyDataUpdate,
        id: baseId,
      },
    });
  });

  it("RECUPERATION DE L'ENSEMBLE DES COMPANIES", async () => {
    const response = await server.executeOperation<TResponseALL>({
      query: COMPANIES,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseALL>({
      companies: [
        {
          name: fakeCompanyDataUpdate.name,
          id: baseId,
        },
      ],
    });
  });

  it("SUPPRESSION DE LA COMPANY", async () => {
    const response = await server.executeOperation<
      TResponseDelete,
      MutationDeleteCompanyArgs
    >({
      query: DELETE_COMPANY,
      variables: {
        id: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseDelete>({
      message: {
        content: "Company deleted",
        success: true,
      },
    });
  });

  it("ERREUR LORS DE LA RECUPERATION D'UNE COMPANY QUI N'EXISTE PAS", async () => {
    const response = await server.executeOperation<TResponse, QueryCompanyArgs>(
      {
        query: COMPANY_BY_ID,
        variables: {
          id: baseId,
        },
      }
    );

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.company).toBeNull();
  });
});
