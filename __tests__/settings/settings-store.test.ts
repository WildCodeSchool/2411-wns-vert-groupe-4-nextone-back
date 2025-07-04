import { ApolloServer } from "@apollo/server";
import {
  createMockStore,
  addMocksToSchema,
  IMockStore,
} from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import {
  DeleteResponse,
  MutationCreateServiceArgs,
  MutationCreateSettingArgs,
  MutationDeleteSettingArgs,
  MutationUpdateSettingArgs,
  QueryGetTicketArgs,
  Setting,
} from "../../src/generated/graphql";
import {
  CREATE_SETTING,
  DELETE_SETTING,
  SETTING,
  SETTINGS,
  UPDATE_SETTING,
} from "../../src/queries/setting.query";
import assert from "assert";

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });
const store = createMockStore({ schema });

const fakeSettings: Setting[] = [
  {
    id: "1",
    name: "setting 1",
  },
  {
    id: "2",
    name: "setting 2",
  },
];

 type TresponseALL = {
  settings: Setting[]
}
 type TResponse = {
  setting: Setting
}
 type TresponseDelete = {
  message: DeleteResponse
}


store.set("Query", "ROOT", "settings", fakeSettings);

const mockedResolver = (store: IMockStore) => ({
  Query: {
    settings: async () => {
      return store.get("Query", "ROOT", "settings");
    },
    setting: async (_: any, { id }: { id: string }) => {
      return store.get("Setting", id);
    },
  },
  Mutation: {
    createSetting: async (_: any, args: MutationCreateServiceArgs) => {
      store.set("Setting", "3", { name: args.data.name });
      return store.get("Setting", "3");
    },
    deleteSetting: async (
      _: any,
      args: { id: string }
    ): Promise<DeleteResponse> => {
      store.reset();
      store.set("Query", "ROOT", "settings", fakeSettings);
      return {
        message: "Setting deleted",
        success: true,
      };
    },
    updateSetting: async (_: any, args: MutationUpdateSettingArgs) => {
      const { id, name } = args.data;
      store.set("Setting", id, { name });
      return store.get("Setting", id);
    },
  },
});

beforeAll(async () => {
  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      store,
      resolvers: mockedResolver,
    }),
  });
});

describe("TESTS SETTINGS DANS UN STORE", () => {
  it("RECUPERATION DES SETTINGS", async () => {
    const response = await server.executeOperation<TresponseALL>({
      query: SETTINGS,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TresponseALL>({
      settings: fakeSettings,
    });
  });

  it("RECUPERATION D'UN SETTING", async () => {
    const response = await server.executeOperation<
      TResponse,
      QueryGetTicketArgs
    >({
      query: SETTING,
      variables: {
        id: "1",
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      setting: fakeSettings[0],
    });
  });

  it("CREATION D'UN SETTING", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationCreateSettingArgs
    >({
      query: CREATE_SETTING,
      variables: {
        data: {
          name: "Nouveau setting",
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      setting: {
        id: "3",
        name: "Nouveau setting",
      },
    });
  });

  it("UPDATE DU SETTING CREE", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationUpdateSettingArgs
    >({
      query: UPDATE_SETTING,
      variables: {
        data: {
          id: "3",
          name: "Nouveau nom.",
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      setting: {
        id: "3",
        name: "Nouveau nom.",
      },
    });
  });

  it("DELETE DU SETTING", async () => {
    const response = await server.executeOperation<
      TresponseDelete,
      MutationDeleteSettingArgs
    >({
      query: DELETE_SETTING,
      variables: {
        id: "3",
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TresponseDelete>({
      message: {
        message: "Setting deleted",
        success: true,
      },
    });
  });
});
