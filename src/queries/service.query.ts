
export const LIST_SERVICES = `#graphql
  query Services {
    services {
      id
      name
      managers {
        email
        id
      }
    }
  }
`;

export const FIND_SERVICE_BY_ID = `#graphql
  query Service($id: UUID!) {
    service(id: $id) {
      id
      name
      managers {
        id
        email
      }
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