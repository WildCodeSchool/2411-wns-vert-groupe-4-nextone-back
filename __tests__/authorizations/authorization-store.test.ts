import assert from "assert";
import {
  IMockStore,
  addMocksToSchema,
  createMockStore,
} from "@graphql-tools/mock";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  Authorization,
  AuthorizationResponse,
  Company,
  Manager,
  ManagerRole,
  MutationAddAuthorizationArgs,
  MutationDeleteAuthorizationArgs,
  MutationUpdateAuthorizationArgs,
  QueryGetEmployeeAuthorizationsArgs,
  QueryGetServiceAuthorizationsArgs,
  Service,
} from "../../src/generated/graphql";
import {
  GET_SERVICE_AUTHORIZATIONS,
  GET_EMPLOYEE_AUTHORIZATIONS,
  ADD_AUTHORIZATION,
  UPDATE_AUTHORIZATION,
  DELETE_AUTHORIZATION,
} from "../../src/queries/autorization.query";
import typeDefs from "../../src/typeDefs";

// Types de réponse
type TMappedAuthorization = {
  isActive: boolean;
  service: Partial<Service>;
  manager: Partial<Manager>;
};

type ResponseList = {
  authorizations: TMappedAuthorization[];
};

type ResponseAdd = {
  addAuthorization: AuthorizationResponse;
};

type ResponseUpdate = {
  updateAuthorization: AuthorizationResponse;
};

type ResponseDelete = {
  deleteAuthorization: AuthorizationResponse;
};

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
  name: "Radiologie",
  id: "8d106e86-5ffb-4e97-bb3a-cba9a329bbef",
  createdAt: "2025-07-04T10:46:24.023Z",
  updatedAt: "2025-07-04T10:46:24.023Z",
  company: fakeCompany,
  isGloballyActive: true,
};

const fakeManager: Manager = {
  id: "1f50e0ca-ad6d-461d-b888-9d08c2ad6ff0",
  email: "michelito@gmail.com",
  firstName: "michel",
  lastName: "dedroite",
  password: "testpass",
  role: ManagerRole.Operator,
  isGloballyActive: false,
  company: fakeCompany,
  authorizations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeAuthorization: Authorization = {
  service: fakeService,
  manager: fakeManager,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Données simulées
const authData: Authorization[] = [fakeAuthorization];
const mappedService: Partial<Service> = {
  id: fakeService.id,
  name: fakeService.name,
};

const mappedManager: Partial<Manager> = {
  id: fakeManager.id,
  firstName: fakeManager.firstName,
  lastName: fakeManager.lastName,
};

const mappedAuthorization: TMappedAuthorization = {
  isActive: fakeAuthorization.isActive,
  service: mappedService,
  manager: mappedManager,
};

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
    addAuthorization: (_: any, { input }: MutationAddAuthorizationArgs) => {
      store.set("Authorization", "auth-1", { isActive: true });
      return { success: true, message: "Authorization successfully created." };
    },
    updateAuthorization: (
      _: any,
      { input }: MutationUpdateAuthorizationArgs
    ) => {
      store.set("Authorization", "auth-1", {isActive:  input.isActive});
      return { success: true, message: "Authorization update failed." };
    },
    deleteAuthorization: (
      _: any,
      { input }: MutationDeleteAuthorizationArgs
    ) => {
      store.set("Query", "ROOT", "getServiceAuthorizations", []);
      store.set("Query", "ROOT", "getEmployeeAuthorizations", []);
      return { success: true, message: "Authorization delete failed." };
    },
  },
});

let server: ApolloServer;

beforeAll(async () => {
  const schema = makeExecutableSchema({ typeDefs, resolvers: {} });
  const store = createMockStore({ schema });

  store.set("Query", "ROOT", "getServiceAuthorizations", authData);
  store.set("Query", "ROOT", "getEmployeeAuthorizations", authData);

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      store,
      resolvers: fakeResolvers(store),
    }),
  });
});

describe("Tests sur les autorisations (depuis le store)", () => {
  const variables:
    | MutationAddAuthorizationArgs
    | MutationUpdateAuthorizationArgs = {
    input: {
      managerId: "1f50e0ca-ad6d-461d-b888-9d08c2ad6ff0",
      serviceId: "8d106e86-5ffb-4e97-bb3a-cba9a329bbef",
    },
  };

  it("Récupère les autorisations par serviceId", async () => {
    const response = await server.executeOperation<ResponseList, QueryGetServiceAuthorizationsArgs>({
      query: GET_SERVICE_AUTHORIZATIONS,
      variables: {
        serviceId: fakeService.id
      }
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual<ResponseList>({
      authorizations: [mappedAuthorization],
    });
  });

  it("Récupère les autorisations par managerId", async () => {
    const response = await server.executeOperation<ResponseList, QueryGetEmployeeAuthorizationsArgs>({
      query: GET_EMPLOYEE_AUTHORIZATIONS,
      variables: {
        managerId: fakeManager.id
      }
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual<ResponseList>({
      authorizations: [mappedAuthorization],
    });
  });

  it("Ajoute une autorisation via la mutation ADD_AUTHORIZATION", async () => {
    const response = await server.executeOperation<
      ResponseAdd,
      MutationAddAuthorizationArgs
    >({
      query: ADD_AUTHORIZATION,
      variables,
    });
    assert(response.body.kind === "single");
    const singleResult = response.body.singleResult;
    expect(singleResult.data).toEqual<ResponseAdd>({
      addAuthorization: {
        success: true,
        message: "Authorization successfully created.",
      },
    });
  });

  it("Met à jour une autorisation (désactivation)", async () => {
    const response = await server.executeOperation<
      ResponseUpdate,
      MutationUpdateAuthorizationArgs
    >({
      query: UPDATE_AUTHORIZATION,
      variables,
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual<ResponseUpdate>({
      updateAuthorization: {
        success: true,
        message: "Authorization update failed.",
      },
    });
  });

  it("Supprime une autorisation simulée", async () => {
    const response = await server.executeOperation<
      ResponseDelete,
      MutationDeleteAuthorizationArgs
    >({
      query: DELETE_AUTHORIZATION,
      variables,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual<ResponseDelete>({
      deleteAuthorization: {
        success: true,
        message: "Authorization delete failed.",
      },
    });
  });
});
