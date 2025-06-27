
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

export const MANAGERS_BY_SERVICES = `#graphql
  query ManagersByServices {
    managersByServices {
      id
      name
      managers {
        email
        id
      }
    }
  }
`

export const MANAGERS_BY_SERVICE = `#graphql
  query ManagersByService($serviceId: ID!) {
    managersByService(serviceId: $serviceId) {
      id
      email
    }
  }
`