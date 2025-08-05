import assert from "assert";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  addMocksToSchema,
  createMockStore,
  IMockStore,
} from "@graphql-tools/mock";

// import Manager from "../../src/entities/Manager.entity";
import {
  InputRegister,
  ManagerRole,
  InputLogin,
  MutationUpdateManagerArgs,
  MutationCreateManagerArgs,
  ManagerWithoutPassword,
  Company,
  Service,
  Manager,
  UpdateManagerInput,
  Message,
} from "../../src/generated/graphql";
import {
  LIST_MANAGERS,
  REGISTER_MANAGER,
  LOGIN_MANAGER,
  LOGOUT_MANAGER,
  FIND_MANAGER_BY_ID,
  DELETE_MANAGER,
  UPDATE_MANAGER,
  TOGGLE_GLOBAL_ACCESS_MANAGER,
} from "../../src/queries/manager.query";
import typeDefs from "../../src/typeDefs";

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
};

type ReponseDisconnectManager = {
  logout: StatusResponse;
};

type ResponseGetManager = {
  manager: Manager;
};

type ResponseDeleteManager = {
  deleteManager: StatusResponse;
};

type ResponseUpdateManager = {
  updateManager: Manager;
};

type ResponseAssociateManagerFromService = {
  associateManagerFromService: StatusResponse;
};

type ResponseDissociateManagerFromService = {
  dissociateManagerFromService: StatusResponse;
};

type ResponseToggleGlobalManager = {
  toggleGlobalAccessManager: {
    isGloballyActive: boolean;
  };
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

const createManagerExample: InputRegister = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  password: "motdepasse",
  role: ManagerRole.Admin,
  isGloballyActive: true,
  companyId: "f363fd0e-cb52-4089-bc25-75c72112d045",
};

const mockManager: ManagerWithoutPassword = {
  id: "1",
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  role: ManagerRole.Admin,
  isGloballyActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  authorizations: [],
  company: fakeCompany,
};

const manager: ManagerWithoutPassword = {
  id: "1",
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  role: ManagerRole.Admin,
  isGloballyActive: true,
  authorizations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  company: fakeCompany,
};

const fakeService: Service = {
  name: "Accueil",
  id: "aa953a24-7b28-4104-924a-d0dcda78131f",
  createdAt: "2025-07-04T10:46:24.023Z",
  updatedAt: "2025-07-04T10:46:24.023Z",
  company: fakeCompany,
  isGloballyActive: true,
};

const listManagers: Partial<Manager>[] = [
  {
    id: "1",
    email: "jean@example.com",
    isGloballyActive: false,
    authorizations: [],
  },
  {
    id: "2",
    email: "jean1@example.com",
    isGloballyActive: false,
    authorizations: [],
  },
];

let server: ApolloServer;

const schema = makeExecutableSchema({
  typeDefs,
});

const store = createMockStore({ schema });

beforeAll(async () => {
  store.set("Query", "ROOT", "managers", listManagers);
  store.set("Manager", "1", manager);

  const mockResolvers = (store: IMockStore) => ({
    Query: {
      managers: () => store.get("Query", "ROOT", "managers"),
      manager: (_: any, { id }: { id: string }) => store.get("Manager", id),
      login: (_: any, { infos }: { infos: InputLogin }) => {
        if (
          infos.email === "jean@example.com" &&
          infos.password === "motdepasse"
        ) {
          return { manager: mockManager, token: "mocked-token-123" };
        }
      },
      logout: (_: any, __: any) => {
        const message: Message = {
          message: "Vous êtes déconnecté",
          success: true,
        };
        return message;
      },
    },
    Mutation: {
      createManager: (_: any, { infos }: { infos: InputRegister }) => {
        const { companyId, ...rest } = infos;
        store.set("Manager", "3", rest);
        const manager = store.get("Manager", "3") as Manager;
        const { password, company, ...result } = manager;
        return { ...result, id: 3 };
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
      toggleGlobalAccessManager: (_: any, args: { id: string }) => {
        const manager = listManagers.find((s) => s.id === args.id);
        if (!manager) throw new Error("Manager not found.");
        manager.isGloballyActive = !manager.isGloballyActive;
        return { success: true, message: "Manager updated successfully." };
      },
    },
  });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      resolvers: mockResolvers,
      store,
    }),
  });
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
    const response = await server.executeOperation<
      ResponseCreateManager,
      MutationCreateManagerArgs
    >({
      query: REGISTER_MANAGER,
      variables: {
        infos: createManagerExample,
      },
    });
    assert(response.body.kind === "single");
    const { password, companyId, ...managerWithoutPassword } =
      createManagerExample;
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
    const { authorizations, company, ...rest } = mockManager;
    expect(response.body.singleResult.data).toEqual({
      login: {
        manager: rest,
        token: "mocked-token-123",
      },
    });
  });

  it("Déconnexion du manager connecté", async () => {
    const response = await server.executeOperation<ReponseDisconnectManager>(
      {
        query: LOGOUT_MANAGER,
      }
      // {
      //   contextValue: {
      //     manager: mockManager,
      //   },
      // }
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
    const { authorizations, company, ...rest } = manager;
    expect(response.body.singleResult.data).toEqual({
      manager: rest,
    });
  });

  it("Suppression d'un manager", async () => {
    const response = await server.executeOperation<ResponseDeleteManager>({
      query: DELETE_MANAGER,
      variables: { deleteManagerId: "1" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      deleteManager: { message: "Manager deleted", success: true },
    });
  });

  it("Mise à jour d'un manager", async () => {
    const updatedFirstName = "Jean-Michel";
    const updatedLastName = "Durand";

    const response = await server.executeOperation<
      ResponseUpdateManager,
      MutationUpdateManagerArgs
    >({
      query: UPDATE_MANAGER,
      variables: {
        id: "1",
        data: {
          firstName: updatedFirstName,
          lastName: updatedLastName,
        },
      },
    });
    assert(response.body.kind === "single");
    const result = response.body.singleResult.data?.updateManager;
    expect(result).toEqual({
      id: "1",
      firstName: updatedFirstName,
      lastName: updatedLastName,
      email: mockManager.email,
      role: mockManager.role,
      isGloballyActive: mockManager.isGloballyActive,
      createdAt: mockManager.createdAt,
      updatedAt: mockManager.updatedAt,
    });
  });

  it("bascule l'accès global d'un Manager", async () => {
    const response = await server.executeOperation<ResponseToggleGlobalManager>(
      {
        query: TOGGLE_GLOBAL_ACCESS_MANAGER,
        variables: { toggleGlobalAccessManagerId: "1" },
      },
      {
        contextValue: {
          manager: { id: "mgr-99", role: "ADMIN" },
        },
      }
    );
    assert(response.body.kind === "single");
    const result = response.body.singleResult.data?.toggleGlobalAccessManager;
    expect(result).toEqual({
      success: true,
      message: "Manager updated successfully.",
    });
  });
});
