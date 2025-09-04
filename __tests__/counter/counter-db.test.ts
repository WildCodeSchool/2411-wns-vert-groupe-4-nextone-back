
//ON MOCK LA DB AVEC CELLE DE TEST
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
  Counter,
  CreateServiceInput,
  DeleteResponse,
  Manager,
  MutationAddManagerOnCounterArgs,
  MutationCreateCounterArgs,
  MutationDeleteCounterArgs,
  MutationRemoveManagerOnCounterArgs,
  MutationUpdateCounterArgs,
  MutationUpdateServiceOnCounterArgs,
  QueryCounterArgs,
  Service,
} from "../../src/generated/graphql";
import ManagerEntity from "../../src/entities/Manager.entity";
import ManagerService from "../../src/services/manager.service";
import {
  ADD_MANAGER_ON_COUNTER,
  COUNTER,
  CREATE_COUNTER,
  DELETE_COUNTER,
  REMOVE_MANAGER_ON_COUNTER,
  UPDATE_COUNTER,
  UPDATE_SERVICES_ON_COUNTER,
} from "../../src/queries/counter.query";
import assert from "assert";
import { validate } from "uuid";
import CompanyEntity from "../../src/entities/Company.entity";
import CompanyService from "../../src/services/company.service";
import { ServiceEntity } from "../../src/entities/Service.entity";
import ServiceService from "../../src/services/services.service";
import { fakeCompanyInput, fakeCounterInput, fakeManagerInput } from "../../src/utils/dataTest";

type TResponse = {
  counter: Partial<Counter> | null;
};

type PartialCounter = {
  id: string;
  name: string;
  isAvailable?: boolean;
  manager: Partial<Manager> | null;
};
type TResponseAdd = {
  counter: PartialCounter;
};

type PartialCounterService = {
  id: string;
  name: string;
  isAvailable?: boolean;
  services: Partial<Service>[];
};
type TResponseServices = {
  counter: PartialCounterService;
};

type TResponseDelete = {
  message: DeleteResponse;
};

let server: ApolloServer;
const schema = makeExecutableSchema({ typeDefs, resolvers });


beforeAll(async () => {
  server = new ApolloServer({
    schema,
  });

  try {
    if (!testDataSource.isInitialized) {
      await testDataSource.initialize();
    }

    await testDataSource.synchronize(true);
  } catch (error) {
    console.error("Error initializing test database:", error);
    throw error;
  }
});


afterAll(async () => {
  //ON VIDE LA DB DE TEST
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
  jest.clearAllMocks();
});

describe("TEST COUTER DANS LA DB", () => {
  let baseId: string;
  let baseManagerId: string;
  let baseCompanyId: string;
  let baseServiceId: string;
  let BaseCompany: CompanyEntity;

  it("CREATION D'UN COUNTER", async () => {
    //CREATION D'UNE COMPANY
    const newCompany: CompanyEntity =
      await CompanyService.getService().createOne(fakeCompanyInput);
    baseCompanyId = newCompany.id;
    BaseCompany = newCompany;

    //CREATION D'UN MANAGER
    fakeManagerInput.companyId = baseCompanyId;
    const newManager: ManagerEntity = await new ManagerService().create(
      fakeManagerInput
    );
    baseManagerId = newManager.id;

    //CREATION D'UN SERVICE
    // const service = new ServiceEntity();
    // service.name = "service TEST";
    // service.company = newCompany;
    const data: CreateServiceInput = {
      companyId: newCompany.id,
      name: "service TEST",

    }
    // service.companyId = newCompany.id;
    const newService: ServiceEntity = await new ServiceService().createService(
      data
    );
    baseServiceId = newService.id;

    fakeCounterInput.serviceIdS.push(baseServiceId);

    //CREATION DU COUNTER
    const response = await server.executeOperation<
      TResponse,
      MutationCreateCounterArgs
    >({
      query: CREATE_COUNTER,
      variables: {
        data: {
          ...fakeCounterInput,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).not.toBeNull();
    const { id } = response.body.singleResult.data?.counter!;
    baseId = id;
    expect(validate(id)).toBeTruthy();
  });

  it("UPDATE DU COUNTER", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationUpdateCounterArgs
    >({
      query: UPDATE_COUNTER,
      variables: {
        data: {
          isAvailable: false,
          id: baseId,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    const { serviceIdS, ...result } = fakeCounterInput;
    expect(response.body.singleResult.data).toEqual<TResponse>({
      counter: {
        ...result,
        isAvailable: false,
        id: baseId,
      },
    });
  });

  it("AJOUT D'UN MANAGER", async () => {
    const response = await server.executeOperation<
      TResponse,
      MutationAddManagerOnCounterArgs
    >({
      query: ADD_MANAGER_ON_COUNTER,
      variables: {
        data: {
          id: baseId,
          managerId: baseManagerId,
        },
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseAdd>({
      counter: {
        id: baseId,
        name: fakeCounterInput.name,
        isAvailable: false,
        manager: {
          id: baseManagerId,
        },
      },
    });
  });

  it("SUPPRESSION DU MANAGER AJOUTE", async () => {
    const response = await server.executeOperation<
      TResponseAdd,
      MutationRemoveManagerOnCounterArgs
    >({
      query: REMOVE_MANAGER_ON_COUNTER,
      variables: {
        id: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseAdd>({
      counter: {
        id: baseId,
        name: fakeCounterInput.name,
        isAvailable: false,
        manager: null,
      },
    });
  });

  it("UPDATE DES SERVICES", async () => {

    //CREATION DUN SECOND SERVICE
    // const serv = new ServiceEntity()
    // // serv.companyId = baseCompanyId
    // serv.company = BaseCompany
    // serv.name = "second service"
    const data: CreateServiceInput = {
      companyId: BaseCompany.id,
      name: "second service",

    }
    const newService: ServiceEntity = await new ServiceService().createService(
      data
    );

    const response = await server.executeOperation<TResponseServices, MutationUpdateServiceOnCounterArgs>({
      query: UPDATE_SERVICES_ON_COUNTER,
      variables: {
        data: {
          id: baseId,
          serviceIdsToAdd: [newService.id],
          serviceIdsToRemove:[baseServiceId]
        }
      }
    })

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseServices>({
      counter: {
        id: baseId,
        name: fakeCounterInput.name,
        isAvailable: false,
        services: [
          {
            id:newService.id
          }
        ]
      },
    });
  })

  it("DELETE DU COUNTER CREE", async () => {
    const response = await server.executeOperation<
      TResponseDelete,
      MutationDeleteCounterArgs
    >({
      query: DELETE_COUNTER,
      variables: {
        id: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponseDelete>({
      message: {
        success: true,
        message: `Counter ${baseId} deleted.`,
      },
    });
  });

  it("RECUPERATION DU COUNTER SUPPRIME", async () => {
    const response = await server.executeOperation<null, QueryCounterArgs>({
      query: COUNTER,
      variables: {
        counterId: baseId,
      },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data).toEqual<TResponse>({
      counter: null,
    });
  });
});
