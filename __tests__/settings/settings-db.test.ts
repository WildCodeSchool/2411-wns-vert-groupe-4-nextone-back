jest.mock("../../src/lib/datasource", () => {
  return {
    __esModule: true,
    default: jest.requireActual("../../src/lib/datasource_test").default,
  };
});
import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "../../src/typeDefs";
import resolvers from "../../src/resolvers";
import testDataSource from "../../src/lib/datasource_test";
import {
  CREATE_SETTING,
  DELETE_SETTING,
  SETTING,
  SETTINGS,
  UPDATE_SETTING,
} from "../../src/queries/setting.query";
import {
  DeleteResponse,
  MutationCreateSettingArgs,
  MutationDeleteSettingArgs,
  MutationUpdateSettingArgs,
  QuerySettingArgs,
  Setting,
} from "../../src/generated/graphql";
import assert from "assert";
import { validate } from "uuid";
import CompanyEntity from "../../src/entities/Company.entity";
import CompanyService from "../../src/services/company.service";
import { fakeCompanyInput } from "../../src/utils/dataTest";

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });

type TresponseALL = {
  settings: Setting[];
};
type TResponse = {
  setting: Setting;
};
type TresponseDelete = {
  message: DeleteResponse;
};





beforeAll(async () => {
  server = new ApolloServer({
    schema,
  });

  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }
    await testDataSource.synchronize(true)
  } catch (error) {
    console.error("Error initializing test database:", error);
    throw error;
  }
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
  }
  await testDataSource.destroy(); //MERCI COLINE 👍

  jest.clearAllMocks();
});

describe("TEST SETTINGS DANS LA DB", () => {
  let companyId: string;
  let createdSetting: Setting;

  it("CREATION D'UN SETTING", async () => {

    //CREATION D'UNE COMPANY
    const company: CompanyEntity = await CompanyService.getService().createOne(
      fakeCompanyInput
    );
    companyId = company.id;

    const response = await server.executeOperation<
      TResponse,
      MutationCreateSettingArgs
    >({
      query: CREATE_SETTING,
      variables: {
        data: {
          name: "Mon zoli setting",
          companyId,
          value: "jambon",
        },
      },
    });
    assert(response.body.kind === "single");

    const { errors, data } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();
    createdSetting = data?.setting!;
    expect(validate(createdSetting.id)).toBeTruthy();
    expect(createdSetting.name).toMatch("Mon zoli setting");
  });

  it("UPDATE DU SETTING", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationUpdateSettingArgs
    >({
      query: UPDATE_SETTING,
      variables: {
        data: {
          id: createdSetting.id,
          name: "Mon setting degueu",
        },
      },
    });

    assert(response.body.kind === "single");
    const { errors, data } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data).not.toBeNull();

    const { id, name } = data?.setting!;
    expect(validate(id)).toBeTruthy();
    expect(name).toMatch("Mon setting degueu");

    //ON MET A JOUR LE NAME
    createdSetting.name = name;
  });

  it("RECUPERATION DE L'ENSEMBLE DES SETTINGS", async () => {
    const response = await server.executeOperation<TresponseALL>({
      query: SETTINGS,
    });

    assert(response.body.kind === "single");
    const { data, errors } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data).toEqual<TresponseALL>({
      settings: [createdSetting],
    });
  });

  it("SUPPRESSION DU SETTING", async () => {
    const response = await server.executeOperation<
      TresponseDelete,
      MutationDeleteSettingArgs
    >({
      query: DELETE_SETTING,
      variables: {
        id: createdSetting.id,
      },
    });

    assert(response.body.kind === "single");
    const { data, errors } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data).toEqual<TresponseDelete>({
      message: {
        message:  "Le paramètre a été supprimé",
        success: true,
      },
    });
  });

  it("ERREUR LORS DE LA RECUPERATION DU SETTING SUPPRIME", async () => {
    const response = await server.executeOperation<TResponse, QuerySettingArgs>(
      {
        query: SETTING,
        variables: {
          id: createdSetting.id,
        },
      }
    );

    assert(response.body.kind === "single");
    const { data, errors } = response.body.singleResult;
    expect(errors).toBeUndefined();
    expect(data?.setting).toBeNull();
  });
});
