// services-mock.test.ts

import assert from 'assert';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import fs from 'fs';
import path from 'path';
import { LIST_SERVICES, FIND_SERVICE_BY_ID,
  CREATE_SERVICE, UPDATE_SERVICE,
  DELETE_SERVICE
} from "../../src/queries/service.query"

const serviceTypeDefs = fs.readFileSync(
  path.join(__dirname, '../../src/typeDefs/service.gql'),
  { encoding: 'utf-8' }
);

// --- Types ---
type BaseService = {
  id: string;
  name: string;
};

type Manager = {
  id: string;
  email: string;
};

type Service = BaseService & {
  managers: Manager[];
};

type ResponseListService = {
  managersByServices: Service[];
};

type ResponseGetService = {
  managersByService: Service;
};

type ResponseCreateServiceData = {
  createService: Service;
};

type ServiceResponse = {
  success: boolean;
  message: string;
};

type ResponseUpdateServiceData = {
  updateService: ServiceResponse;
};

type ResponseDeleteServiceData = {
  deleteService: ServiceResponse;
};

let servicesData: BaseService[];
let servicesDataWithManagers: Service[];
let server: ApolloServer;

beforeAll(async () => {
    servicesData = [
    { id: 'uuid-1', name: 'Radiologie' },
    { id: 'uuid-2', name: 'Cardiologie' },
    { id: 'uuid-3', name: 'Pneumologie' },
  ];

  servicesDataWithManagers = [
    { id: 'uuid-1', name: 'Radiologie',
      managers: [
        { id: 'mgr-1', email: 'Alice@gmail.com' },
        { id: 'mgr-2', email: 'Bob@gmail.com' },
      ],
    },
    { id: 'uuid-2', name: 'Cardiologie',
      managers: [{ id: 'mgr-3', email: 'Charlie@gmail.com' }],
    },
    { id: 'uuid-3', name: 'Pneumologie',
      managers: [],
    },
  ]

  const serviceResolvers = {
    Query: {
      services: () => servicesDataWithManagers,
      service: (_: any, args: { id: string }) => {
        const service = servicesDataWithManagers.find((s) => s.id === args.id);
        if (!service) throw new Error('Service not found');
        return service;
      },
    },
    Mutation: {
      createService: (_: any, args: { data: { name: string } }) => {
        const newService = {
          id: `uuid-${servicesData.length + 1}`,
          name: args.data.name,
        };
        servicesData.push(newService);
        return newService;
      },
      updateService: (_: any, args: { id: string; data: { name: string } }) => {
        const index = servicesData.findIndex((s) => s.id === args.id);
        if (index === -1) return { success: false, message: "Service not found." };
        servicesData[index] = { ...servicesData[index], ...args.data };
        return { success: true, message: "Service updated successfully." };
      },
      deleteService: (_: any, args: { id: string }) => {
        const index = servicesData.findIndex((s) => s.id === args.id);
        if (index === -1) return { success: false, message: "Service not found." };
        servicesData.splice(index, 1);
        return { success: true, message: "Service deleted successfully." };
      },
    },
  };

  const schema = makeExecutableSchema({
    typeDefs: serviceTypeDefs,
    resolvers: serviceResolvers,
  });

  server = new ApolloServer({ schema });
  await server.start();
});

// --- Tests ---
describe('ServicesResolver (mocked)', () => {
   it('récupère tous les services', async () => {
    const response = await server.executeOperation<ResponseListService>({
      query: LIST_SERVICES,
    });
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data).toEqual({
      services: servicesDataWithManagers,
    });
  });

  it("récupère un service par son ID", async () => {
    const response = await server.executeOperation<ResponseGetService>({
      query: FIND_SERVICE_BY_ID,
      variables: { id: 'uuid-1' },
    });
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data).toEqual({
      service: servicesDataWithManagers.find((s) => s.id === 'uuid-1'),
    });
  });

  it('crée un nouveau service', async () => {
    const response = await server.executeOperation<ResponseCreateServiceData>({
      query: CREATE_SERVICE,
      variables: { data: { name: 'Dermatologie' } },
    });
    assert(response.body.kind === 'single');
    const created = response.body.singleResult.data?.createService;
    expect(created).toBeDefined();
    expect(created?.name).toBe('Dermatologie');
    expect(created?.id).toBeDefined();
  });

  it('met à jour un service', async () => {
    const response = await server.executeOperation<ResponseUpdateServiceData>({
      query: UPDATE_SERVICE,
      variables: { id: 'uuid-1', data: { name: 'Radiologie Avancée' } },
    });
    assert(response.body.kind === 'single');
    const updated = response.body.singleResult.data?.updateService;
    expect(updated?.success).toBe(true);
    expect(updated?.message).toBe('Service updated successfully.');
  });

  it('supprime un service', async () => {
    const response = await server.executeOperation<ResponseDeleteServiceData>({
      query: DELETE_SERVICE,
      variables: { id: 'uuid-2' },
    });
    assert(response.body.kind === 'single');
    const deleted = response.body.singleResult.data?.deleteService;
    expect(deleted?.success).toBe(true);
    expect(deleted?.message).toBe('Service deleted successfully.');
  });
});