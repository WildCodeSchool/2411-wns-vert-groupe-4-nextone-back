import assert from "assert";
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema, createMockStore, IMockStore } from "@graphql-tools/mock";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import Manager from "../src/entities/Manager.entity";
import { InputRegister, ManagerRole } from "../src/generated/graphql";
import ManagerEntity from "../src/entities/Manager.entity";

const managerTypeDefs = loadFilesSync(path.join(__dirname, "../src/typeDefs/user.gql"), {
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

// la requete me retourne ces infos
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

type ResponseData = {
  managers: Manager[];
};

type ResponseDataCreate = {
  register: Manager;
};

const managersData = [
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
    },
    Mutation: {
      register: (_: any, { infos }: { infos: InputRegister }) => {
        store.set("Manager", "3", infos);
        const {password, ...result} = store.get("Manager", "3") as Manager;
        return result
      },
    },
  });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      resolvers: mockResolvers,
      store
    }),
  });
  store.set("Query", "ROOT", "managers", managersData);
});

describe("Test sur les managers", () => {
  it("Récupération des managers depuis le store", async () => {
    const response = await server.executeOperation<ResponseData>({
      query: LIST_MANAGERS,
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.data).toEqual({
      managers: managersData,
    });
  });

  it("Inscription d'un manager", async () => {
    const response = await server.executeOperation<ResponseDataCreate>({
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
});
