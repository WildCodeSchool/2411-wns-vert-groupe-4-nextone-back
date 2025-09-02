import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import {
  addMocksToSchema,
  createMockStore,
  IMockStore,
} from "@graphql-tools/mock";
import CompanyEntity from "../../src/entities/Company.entity";
import assert from "assert";
import {
  Company,
  CreateCompanyInput,
  DeleteResponseCompany,
  MutationCreateCompanyArgs,
  MutationDeleteCompanyArgs,
  MutationUpdateCompanyArgs,
  QueryCompanyArgs,
} from "../../src/generated/graphql";
import {
  COMPANIES,
  COMPANY_BY_ID,
  CREATE_COMPANY,
  DELETE_COMPANY,
  UPDATE_COMPANY,
} from "../../src/queries/company.query";

const fakeCompanies: Partial<CompanyEntity>[] = [
  {
    id: "1",
    name: "Google",
  },
  {
    id: "2",
    name: "Amazon",
  },
];

type TResponse = {
  companies: Company[];
};

type TResponseCreate = {
  company: Company;
};
type TResponseDelete = {
  message: DeleteResponseCompany;
};

const fakeCreationData: CreateCompanyInput = {
  name: "test",
  address: "test",
  siret: "test",
  email: "test",
  phone: "test",
  city: "test",
  postalCode: "test"
};

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });
const store = createMockStore({ schema });

store.set("Query", "ROOT", "companies", fakeCompanies);

const fakeResolvers = (store: IMockStore) => ({
  Query: {
    companies: () => {
      return store.get("Query", "ROOT", "companies");
    },
    company: (_: any, { id }: { id: string }) => {
      return store.get("Company", id);
    },
  },
  Mutation: {
    createCompany: (_: any, { data }: MutationCreateCompanyArgs) => {
      store.set("Company", "3", data);
      return store.get("Company", "3");
    },
    deleteCompany: (_: any, { id }: MutationDeleteCompanyArgs) => {
      store.reset();
      store.set("Query", "ROOT", "companies", fakeCompanies);
      return {
        message: "Company 3 deleted",
        success: true,
      };
    },
    updateCompany: (_: any, args: MutationUpdateCompanyArgs) => {
      store.set("Company", args.data.id, { ...args.data });
      return store.get("Company", "3");
    },
  },
});

beforeAll(() => {
  server = new ApolloServer({
    schema: addMocksToSchema({ schema, store, resolvers: fakeResolvers }),
  });
});

describe("TEST DES COMPANIES DANS LE STORE", () => {
  it("RECUPERATION DES COMPANIES", async () => {
    const response = await server.executeOperation<TResponse>({
      query: COMPANIES,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      companies: fakeCompanies,
    });
  });

  it("RECUPERATION DE LA COMPANY ID 1", async () => {
    const response = await server.executeOperation<TResponse, QueryCompanyArgs>({
      query: COMPANY_BY_ID,
      variables: {
        id: "1",
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      company: fakeCompanies[0],
    });
  });

  it("CREATION D'UNE COMPANY", async () => {
    const response = await server.executeOperation<TResponseCreate, MutationCreateCompanyArgs>({
      query: CREATE_COMPANY,
      variables: {
        data: fakeCreationData,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      company: {
        id: "3",
        name: "test",
      },
    });
  });

  it("UPDATE COMPANY", async () => {
    const response = await server.executeOperation<
      any,
      MutationUpdateCompanyArgs
    >({
      query: UPDATE_COMPANY,
      variables: {
        data: {
          id: "3",
          name: "Updated name.",
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual({
      updateCompany: {
        id: "3",
        name: "Updated name.",
      },
    });
  });

  it("DELETE D'UNE COMPANY", async () => {
    const response = await server.executeOperation<TResponse, MutationDeleteCompanyArgs>({
      query: DELETE_COMPANY,
      variables: {
        id: "3",
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseDelete>({
      message: {
        message: "Company 3 deleted",
        success: true,
      },
    });
  });
});
