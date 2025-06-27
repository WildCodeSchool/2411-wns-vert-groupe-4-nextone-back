import assert from "assert";
import {
  IMockStore,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { NewAuthInput, UpdateAuthInput } from "../../src/generated/graphql";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import { LIST_BY_SERVICE, 
  LIST_BY_MANAGER,
  ADD_AUTHORIZATION,
  UPDATE_AUTHORIZATION,
  DELETE_AUTHORIZATION
} from "../../src/queries/autorization.query"

// Chargement du schéma GQL
const authorizationTypeDefs = loadFilesSync(
  path.join(__dirname, "../../src/typeDefs/authorization.gql"),
  { extensions: ["gql"] }
);

// Types de réponse
type ResponseList = {
  getServiceAuthorizations: {
    serviceId: string;
    managerId: string;
    isActive: boolean;
  }[];
};

type ResponseAdd = {
  addAuthorization: boolean;
};

type ResponseUpdate = {
  updateAuthorization: boolean;
};

type ResponseDelete = {
  deleteAuthorization: boolean;
};

// Données simulées
const authData = [
  {
    serviceId: "service-1",
    managerId: "manager-1",
    isActive: true,
    createdAt: new Date(),
  },
];

// Resolvers mockés
const fakeResolvers = (store: IMockStore) => ({
  Query: {
    getServiceAuthorizations: () => {
      return store.get("Query", "ROOT", "getServiceAuthorizations");
    },
    getEmployeeAuthorizations: () => {
      return store.get("Query", "ROOT", "getEmployeeAuthorizations");
    },
  },
  Mutation: {
    addAuthorization: (_: null, { input }: { input: NewAuthInput }) => {
      store.set("Authorization", "auth-1", { ...input, isActive: true });
      return true;
    },
    updateAuthorization: (_: null, { input }: { input: UpdateAuthInput }) => {
      store.set("Authorization", "auth-1", input);
      return true;
    },
    deleteAuthorization: () => {
      store.set("Query", "ROOT", "getServiceAuthorizations", []);
      store.set("Query", "ROOT", "getEmployeeAuthorizations", []);
      return true;
    },
  },
});

let server: ApolloServer;

beforeAll(async () => {
  const schema = makeExecutableSchema({ typeDefs: authorizationTypeDefs, resolvers: {} });
  const store = createMockStore({ schema });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      store,
      resolvers: fakeResolvers(store),
    }),
  });

  store.set("Query", "ROOT", "getServiceAuthorizations", authData);
  store.set("Query", "ROOT", "getEmployeeAuthorizations", authData);
});

describe("Tests sur les autorisations (depuis le store)", () => {
  it("Récupère les autorisations par serviceId", async () => {
    const response = await server.executeOperation<ResponseList>({
      query: LIST_BY_SERVICE,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      getServiceAuthorizations: [
        {
          serviceId: "service-1",
          managerId: "manager-1",
          isActive: true,
        },
      ],
    });
  });

  it("Récupère les autorisations par managerId", async () => {
    const response = await server.executeOperation<ResponseList>({
      query: LIST_BY_MANAGER,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      getEmployeeAuthorizations: [
        {
          serviceId: "service-1",
          managerId: "manager-1",
          isActive: true,
        },
      ],
    });
  });

  it("Ajoute une autorisation", async () => {
    const response = await server.executeOperation<ResponseAdd>({
      query: ADD_AUTHORIZATION,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      addAuthorization: true,
    });
  });

  it("Met à jour une autorisation (désactivation)", async () => {
    const response = await server.executeOperation<ResponseUpdate>({
      query: UPDATE_AUTHORIZATION,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      updateAuthorization: true,
    });
  });

  it("Supprime une autorisation simulée", async () => {
    const response = await server.executeOperation<ResponseDelete>({
      query: DELETE_AUTHORIZATION,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      deleteAuthorization: true,
    });
  });
});
