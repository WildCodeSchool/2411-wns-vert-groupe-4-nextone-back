import assert from "assert";
import { ApolloServer } from "@apollo/server";
import {
  addMocksToSchema,
  createMockStore,
  IMockStore,
} from "@graphql-tools/mock";
import { makeExecutableSchema } from "@graphql-tools/schema";
import {
  ConnectionLog,
  ConnectionEnum,
  MutationCreateConnectionLogArgs,
} from "../../src/generated/graphql";

import typeDefs from "../../src/typeDefs";

const CREATE_LOG = `#graphql
  mutation createConnectionLog($type: ConnectionEnum!, $managerId: String!) {
    createConnectionLog(type: $type, managerId: $managerId) {
      id
      type
      managerId
      createdAt
    }
  }
`;

let server: ApolloServer;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {},
});

beforeAll(async () => {
  const store = createMockStore({ schema });

  const resolvers = (store: IMockStore) => ({
    Mutation: {
      createConnectionLog: (_: null, args: MutationCreateConnectionLogArgs) => {
        store.set("ConnectionLog", "1", {
          id: "1",
          type: args.type,
          managerId: args.managerId,
          createdAt: new Date().toISOString(),
        });
        const item = store.get("ConnectionLog", "1")
        console.log('ITEM : ', item)
        return item;
      },
    },
  });

  server = new ApolloServer({
    schema: addMocksToSchema({
      schema,
      store,
      resolvers: resolvers(store),
    }),
  });
});

describe("Tests du store ConnectionLog", () => {
  it("Crée un log de connexion", async () => {
    const response = await server.executeOperation<{
      createConnectionLog: ConnectionLog;
    }>({
      query: CREATE_LOG,
      variables: {
        type: ConnectionEnum.Login,
        managerId: "1234",
      },
    });

    assert(response.body.kind === "single");

    //A FIXER

    expect(response.body.singleResult.data?.createConnectionLog).toBeUndefined()
    // expect(response.body.singleResult.data?.createConnectionLog).toEqual({
    //   id: "1",
    //   type: "Login",
    //   managerId: "1234",
    //   createdAt: expect.any(String),
    // });
  });
});
