import { ApolloServer } from "@apollo/server"
import { createMockStore, addMocksToSchema, IMockStore } from "@graphql-tools/mock"
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers"

let server: ApolloServer
const schema = makeExecutableSchema({ typeDefs, resolvers })
const store = createMockStore({ schema })

const mockedResolver = (store: IMockStore) => ({
  Query: {
    
  },
  Mutation: {
    
  }
})

beforeAll( async () => {
  server = new ApolloServer({
    schema: addMocksToSchema({
      schema, store, resolvers: mockedResolver
    })
  })
})

describe("TESTS SETTINGS DANS UN STORE", () => {

  it("RECUPERATION DES SETTINGS", async () => {

  })
})