import assert from "assert";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema, createMockStore, IMockStore } from "@graphql-tools/mock";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import Manager from "../../src/entities/Manager.entity";
import { InputRegister, ManagerRole, InputLogin, MutationUpdateManagerArgs } from "../../src/generated/graphql";
import { LIST_MANAGERS, REGISTER_MANAGER,
  LOGIN_MANAGER, LOGOUT_MANAGER,
  FIND_MANAGER_BY_ID, DELETE_MANAGER,
  UPDATE_MANAGER, ASSOCIATE_MANAGER_AT_SERVICE,
  DISSOCIATE_MANAGER_FROM_SERVICE,
  TOGGLE_GLOBAL_ACCESS_MANAGER
 } from "../../src/queries/manager.query"

const managerTypeDefs = loadFilesSync(path.join(__dirname, "../../src/typeDefs/manager.gql"), {
  extensions: ["gql"],
});

const serviceTypeDefs = loadFilesSync(path.join(__dirname, "../../src/typeDefs/service.gql"), {
  extensions: ["gql"],
});
const combinedTypeDefs = [...managerTypeDefs, ...serviceTypeDefs];

type StatusResponse = {
  message: string;
  success: boolean;
};

type ResponseListManager = {
  managers: Manager[];
};

type ResponseCreateManager = {
  createManager: Manager;
};

type ResponseLoginManager = {
  manager: Manager;
  token: string;
}

type ReponseDisconnectManager = {
  logout: StatusResponse
}

type ResponseGetManager = {
  manager: Manager;
}

type ResponseDeleteManager = {
  deleteManager: StatusResponse;
}

type ResponseUpdateManager = {
  updateManager: Manager;
}

type ResponseAssociateManagerFromService = {
  associateManagerFromService: StatusResponse
}

type ResponseDissociateManagerFromService = {
  dissociateManagerFromService: StatusResponse
}

type ResponseToggleGlobalManager = {
  toggleGlobalAccessManager: {
    is_globally_active: boolean;
  }
}

const listManagers = [
  { 
    id: "1", 
    email: "jean@example.com",
    services: [
      {
        id: "10",
        name: "Service Test",
      }
    ],
    is_globally_active: false,
  },
  { 
    id: "2", 
    email: "jean1@example.com",
    services: [],
    is_globally_active: false,
  },
];


const createManagerExample = {
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean@example.com",
  password: "motdepasse",
  role: ManagerRole.Admin,
  is_globally_active: true,
};

const mockManager = {
  id: "1",
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean@example.com",
  role: ManagerRole.Admin,
  is_globally_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const manager = {
  id: "1",
  first_name: "Jean",
  last_name: "Dupont",
  email: "jean@example.com",
  role: ManagerRole.Admin,
  is_globally_active: true,
  services: [
      {
        id: "10",
        name: "Service Test",
      }
    ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

let server: ApolloServer;

const schema = makeExecutableSchema({
  typeDefs: combinedTypeDefs,
});

const store = createMockStore({schema})

beforeAll(async () => {
  const mockResolvers = (store: IMockStore) => ({
    Query: {
      managers: () => 
        store.get("Query", "ROOT", "managers"),
      manager: (_: any, { id }: { id: string }) => 
        store.get("Manager", id),
      login: (_: any, { infos }: { infos: InputLogin }) => {
        if (infos.email === "jean@example.com" && infos.password === "motdepasse") {
          return { manager: mockManager, token: "mocked-token-123" };
        }
      },
      logout: (_: any, __: any) => 
        ({ message: "Vous êtes déconnecté", success: true }),
    },
    Mutation: {
      createManager: (_: any, { infos }: { infos: InputRegister }) => {
        store.set("Manager", "3", infos);
        const { password, ...result } = store.get("Manager", "3") as Manager;
        return result;
      },
      deleteManager: (_: null, { id }: { id: string }) => {
        store.get("Manager", id);
        store.reset();
        store.set("Query", "ROOT", "managers", listManagers);
        return { message: "Manager deleted", success: true };
      },
      updateManager: (_: null, { data }: MutationUpdateManagerArgs) => {
        store.set("Manager", "1", { ...mockManager, ...data });
        return store.get("Manager", "1");
      },
      associateManagerAtService: (_: any) => {
        return {
          message: "Manager associé au service avec succès",
          success: true,
        };
      },
      dissociateManagerFromService: (_: any) => {
        return {
          message: "Manager dissocié du service spécifié",
          success: true,
        };
      },
      toggleGlobalAccessManager: (_: any, args: { id: string }) => {
        const manager = listManagers.find(s => s.id === args.id);
        if (!manager) throw new Error("Manager not found.");
        manager.is_globally_active = !manager.is_globally_active;
        return { is_globally_active: manager.is_globally_active };
      }
    },
  });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      resolvers: mockResolvers,
      store
    }),
  });
  store.set("Query", "ROOT", "managers", listManagers);
  store.set("Manager", "1", manager);
});

describe("Test sur les managers", () => {
  it("Récupération des managers depuis le store", async () => {
    const response = await server.executeOperation<ResponseListManager>({
      query: LIST_MANAGERS,
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      managers: listManagers,
    });
  });


  it("Inscription d'un manager", async () => {
    const response = await server.executeOperation<ResponseCreateManager>({
      query: REGISTER_MANAGER,
      variables: {
        infos: createManagerExample,
      },
    });
    assert(response.body.kind === "single");
    const { password, ...managerWithoutPassword } = createManagerExample;
    expect(response.body.singleResult.data).toEqual({
      createManager: { id: "3", ...managerWithoutPassword },
    });
  });

  it("Connexion avec un email et mot de passe valides", async () => {
    const response = await server.executeOperation<ResponseLoginManager>({
      query: LOGIN_MANAGER,
      variables: {
        infos: {
          email: "jean@example.com",
          password: "motdepasse",
        },
      },
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      login: {
        manager: mockManager,
        token: "mocked-token-123",
      },
    });
  });

  it("Déconnexion du manager connecté", async () => {
    const response = await server.executeOperation<ReponseDisconnectManager>({ 
      query: LOGOUT_MANAGER },
      {
        contextValue: {
          manager: mockManager,
        },
      }
    );
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      logout: {
        message: "Vous êtes déconnecté",
        success: true,
      },
    });
  });

  it("Récupération d'un manager par son id après l'ajout", async () => {
    const response = await server.executeOperation<ResponseGetManager>({
      query: FIND_MANAGER_BY_ID,
      variables: { managerId: "1" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      manager: manager
    });
  })

  it("Suppression d'un manager", async () => {
    const response = await server.executeOperation<ResponseDeleteManager>({
      query: DELETE_MANAGER,
      variables: { deleteManagerId: "1" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      deleteManager: { message: "Manager deleted", success: true },
    });
  })

  it("Mise à jour d'un manager", async () => {
    const updatedFirstName = "Jean-Michel";
    const updatedLastName = "Durand";

    const response = await server.executeOperation<ResponseUpdateManager>({
      query: UPDATE_MANAGER,
      variables: {
        updateManagerId: "1",
        data: {
          first_name: updatedFirstName,
          last_name: updatedLastName,
        },
      },
    });
    assert(response.body.kind === "single");
    const result = response.body.singleResult.data?.updateManager;
    expect(result).toEqual({
      id: "1",
      first_name: updatedFirstName,
      last_name: updatedLastName,
      email: mockManager.email,
      role: mockManager.role,
      is_globally_active: mockManager.is_globally_active,
      created_at: mockManager.created_at,
      updated_at: mockManager.updated_at,
    });
  });

  it("Associe un manager à un service", async () => {
  const response = await server.executeOperation<ResponseAssociateManagerFromService>({
    query: ASSOCIATE_MANAGER_AT_SERVICE,
    variables: {
      managerId: "1",
      serviceId: "10",
    },
  });
  assert(response.body.kind === "single");
  expect(response.body.singleResult.data).toEqual({
  associateManagerAtService: {
    message: "Manager associé au service avec succès",
    success: true,
  },
});
});

  it("Dissocie un manager d un service", async () => {
    const response = await server.executeOperation<ResponseDissociateManagerFromService>(
      {
        query: DISSOCIATE_MANAGER_FROM_SERVICE,
        variables: {
          managerId: "1",
          serviceId: "101",
        },
      },
    );
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      dissociateManagerFromService: {
        message: "Manager dissocié du service spécifié",
        success: true,
      },
    });
  });

  it("bascule l'accès global d'un service", async () => {
    const response = await server.executeOperation<ResponseToggleGlobalManager>({
      query: TOGGLE_GLOBAL_ACCESS_MANAGER,
      variables: { toggleGlobalAccessManagerId: '1' },
    }, {
      contextValue: {
        manager: { id: 'mgr-99', role: 'ADMIN' }, 
      },
    });
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data).toEqual({
      toggleGlobalAccessManager: {
        is_globally_active: true, 
      },
    });
  })
})