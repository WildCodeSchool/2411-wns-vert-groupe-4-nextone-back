import assert from "assert";
import Authorization from "../../src/entities/Authorization.entity";
import {
  IMockStore,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import AuthorizationResolver from "../../src/resolvers/authorization.resolver";
import { NewAuthInput, UpdateAuthInput } from "../../src/generated/graphql";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";

// Chargement du schéma GQL
const authorizationTypeDefs = loadFilesSync(
  path.join(__dirname, "../../src/typeDefs/authorization.gql"),
  { extensions: ["gql"] }
);

// Requêtes GQL
const LIST_BY_SERVICE = `#graphql
  query {
    getServiceAuthorizations(serviceId: "service-1") {
      serviceId
      managerId
      isActive
    }
  }
`;

const LIST_BY_MANAGER = `#graphql
  query {
    getEmployeeAuthorizations(managerId: "manager-1") {
      serviceId
      managerId
      isActive
    }
  }
`;

const ADD_AUTHORIZATION = `#graphql
  mutation {
    addAuthorization(input: {
      serviceId: "service-1"
      managerId: "manager-1"
    })
  }
`;

const UPDATE_AUTHORIZATION = `#graphql
  mutation {
    updateAuthorization(input: {
      serviceId: "service-1"
      managerId: "manager-1"
      isActive: false
    })
  }
`;

const DELETE_AUTHORIZATION = `#graphql
  mutation {
    deleteAuthorization(serviceId: "service-1", managerId: "manager-1")
  }
`;


// Types de réponse
type ResponseList = {
  getServiceAuthorizations: Authorization[];
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
const authData: Authorization[] = [
  {
    serviceId: "service-1",
    managerId: "manager-1",
    isActive: true,
    createdAt: new Date(),
  },
];

let server: ApolloServer;

const schema = makeExecutableSchema({ typeDefs: authorizationTypeDefs, resolvers: AuthorizationResolver });

// Mock du store
beforeAll(async () => {
  const store = createMockStore({ schema });
  const resolvers = (store: IMockStore) => ({
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
        const beforeDelete = store.get("Query", "ROOT", "getServiceAuthorizations");
        console.log("🗑️ Suppression simulée de l'autorisation", beforeDelete);
        store.set("Query", "ROOT", "getServiceAuthorizations", []); // vide la liste
        store.set("Query", "ROOT", "getEmployeeAuthorizations", []); 
        const afterDelete = store.get("Query", "ROOT", "getServiceAuthorizations");
        console.log("✅ Données après suppression :", afterDelete);
        return true;
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
