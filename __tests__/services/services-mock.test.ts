// services-mock.test.ts

import assert from 'assert';
import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import fs from 'fs';
import path from 'path';

const serviceTypeDefs = fs.readFileSync(
  path.join(__dirname, '../../src/typeDefs/service.gql'),
  { encoding: 'utf-8' }
);

// --- GraphQL Queries ---
export const LIST_SERVICES = `#graphql
  query Services {
    services {
      id
      name
    }
  }
`;

export const FIND_SERVICE_BY_ID = `#graphql
  query Service($serviceId: UUID!) {
    service(id: $serviceId) {
      id
      name
    }
  }
`;

export const CREATE_SERVICE = `#graphql
  mutation CreateService($data: CreateServiceInput!) {
    createService(data: $data) {
      id
      name
    }
  }
`;

export const UPDATE_SERVICE = `#graphql
  mutation UpdateService($id: UUID!, $data: UpdateServiceInput!) {
    updateService(id: $id, data: $data) {
      success
      message
    }
  }
`;

export const DELETE_SERVICE = `#graphql
  mutation DeleteService($id: UUID!) {
    deleteService(id: $id) {
      success
      message
    }
  }
`;

// --- Types ---
type Service = {
  id: string;
  name: string;
};

type ResponseData = {
  services: Service[];
};

type ResponseOneServiceData = {
  service: Service | null;
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

let servicesData: Service[];
let server: ApolloServer;

beforeAll(async () => {
  servicesData = [
    { id: 'uuid-1', name: 'Radiologie' },
    { id: 'uuid-2', name: 'Cardiologie' },
    { id: 'uuid-3', name: 'Pneumologie' },
  ];

  const serviceResolvers = {
    Query: {
      services: () => servicesData,
      service: (_: any, args: { id: string }) =>
        servicesData.find((s) => s.id === args.id) || null,
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
    const response = await server.executeOperation<ResponseData>({ query: LIST_SERVICES });
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data).toEqual({ services: servicesData });
  });

  it('récupère un service par ID', async () => {
    const response = await server.executeOperation<ResponseOneServiceData>({
      query: FIND_SERVICE_BY_ID,
      variables: { serviceId: 'uuid-1' },
    });
    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data).toEqual({ service: servicesData[0] });
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
