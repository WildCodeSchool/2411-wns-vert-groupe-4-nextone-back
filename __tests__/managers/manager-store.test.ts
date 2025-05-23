import assert from "assert";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema, createMockStore, IMockStore } from "@graphql-tools/mock";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import Manager from "../../src/entities/Manager.entity";
import { InputRegister, ManagerRole, InputLogin, MutationUpdateManagerArgs } from "../../src/generated/graphql";
import { ListCollectionsCursor } from "typeorm";

const managerTypeDefs = loadFilesSync(path.join(__dirname, "../../src/typeDefs/manager.gql"), {
  extensions: ["gql"],
});

export const LIST_MANAGERS = `#graphql
  query Managers {
    managers {
      email
      id
    }
  }
`;

export const REGISTER_MANAGER = `#graphql
  mutation register($infos: InputRegister!) {
    register(infos: $infos) {
      email
      first_name
      id
      is_globally_active
      last_name
      role
    }
  }
`;

export const LOGIN_MANAGER = `#graphql
  query login($infos: InputLogin!) {
    login(infos: $infos) {
      manager {
        id
        first_name
        last_name
        email
        role
        is_globally_active
        created_at
        updated_at
      }
      token
    }
  }
`

export const LOGOUT_MANAGER = `#graphql
  query Logout {
    logout {
      content
      status
    }
  }
`

export const FIND_MANAGER_BY_ID = `#graphql
  query manager($managerId: ID!) {
    manager(id: $managerId) {
      id
      first_name
      last_name
      email
      role
      is_globally_active
      created_at
      updated_at
    }
  }
`

export const DELETE_MANAGER = `#graphql
  mutation DeleteManager($deleteManagerId: ID!) {
    deleteManager(id: $deleteManagerId) {
      content
      status
    }
  }
` 

export const UPDATE_MANAGER = `#graphql
  mutation updateManager($data: UpdateManagerInput!) {
    updateManager(data: $data) {
      id
      first_name
      last_name
      email
      role
      is_globally_active
      created_at
      updated_at
    }
  }
`

type ResponseListManager = {
  managers: Manager[];
};

type ResponseCreateManager = {
  register: Manager;
};

const listManagers = [
  {
    id: "1",
    email: "jean@example.com",
  },
    {
    id: "2",
    email: "jean1@example.com",
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

let server: ApolloServer;

const schema = makeExecutableSchema({
  typeDefs: managerTypeDefs,
});

const store = createMockStore({schema})

beforeAll(async () => {
  const mockResolvers = (store: IMockStore) => ({
    Query: {
      managers: () => {
        return store.get("Query", "ROOT", "managers")
      },

      manager: (_: any, { id }: { id: string }) => {
        return store.get("Manager", id);
      },

      login: (_: any, { infos }: { infos: InputLogin }) => {
        if (infos.email === "jean@example.com" && infos.password === "motdepasse") {
          return {
            manager: mockManager,
            token: "mocked-token-123",
          };
        }
      },
      logout: (_: any, __: any, ctx: any) => {
        return { content: "Vous êtes déconnecté", status: true };
      },
    },
    Mutation: {
      register: (_: any, { infos }: { infos: InputRegister }) => {
        store.set("Manager", "3", infos);
        const {password, ...result} = store.get("Manager", "3") as Manager;
        return result
      },

      deleteManager: (_: null, { id }: { id: string }) => {
        store.get("Manager", id);
        store.reset()
        store.set("Query", "ROOT", "managers", listManagers);
        return { content: "Manager deleted", status: true };
      },

      updateManager: (_: null, { data }: MutationUpdateManagerArgs) => {
        store.set("Manager", "1", { ...mockManager, ...data });
        return store.get("Manager", "1");
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
  store.set("Manager", "1", mockManager);
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
    const {password, ...managerWithoutPassword} = createManagerExample;
    expect(response.body.singleResult.data).toEqual({
      register: {id: "3", ...managerWithoutPassword}
    });
  });

  it("Connexion avec un email et mot de passe valides", async () => {
    const response = await server.executeOperation({
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
    const response = await server.executeOperation(
    { query: LOGOUT_MANAGER },
    {
      contextValue: {
        manager: mockManager,
      },
    }
    );
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      logout: {
        content: "Vous êtes déconnecté",
        status: true,
      },
    });
  });

  it("Récupération d'un ticket par son id après l'ajout", async () => {
    const response = await server.executeOperation<ResponseListManager>({
      query: FIND_MANAGER_BY_ID,
      variables: { managerId: "1" },
    });
    
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      manager: mockManager
    });
  })

   it("Suppression d'un ticket", async () => {
    const response = await server.executeOperation<ResponseListManager>({
      query: DELETE_MANAGER,
      variables: { deleteManagerId: "1" },
    });
    
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      deleteManager: { content: "Manager deleted", status: true },
    });
  })

   it("Mise à jour d'un manager", async () => {
    const updatedFirstName = "Jean-Michel";
    const updatedLastName = "Durand";

    const response = await server.executeOperation({
      query: UPDATE_MANAGER,
      variables: {
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

});