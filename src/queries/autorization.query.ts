export const LIST_BY_SERVICE = `#graphql
  query {
    getServiceAuthorizations(serviceId: "service-1") {
      serviceId
      managerId
      isActive
    }
  }
`;

export const LIST_BY_MANAGER = `#graphql
  query {
    getEmployeeAuthorizations(managerId: "manager-1") {
      serviceId
      managerId
      isActive
    }
  }
`;

export const ADD_AUTHORIZATION = `#graphql
  mutation {
    addAuthorization(input: {
      serviceId: "service-1"
      managerId: "manager-1"
    })
  }
`;

export const UPDATE_AUTHORIZATION = `#graphql
  mutation {
    updateAuthorization(input: {
      serviceId: "service-1"
      managerId: "manager-1"
      isActive: false
    })
  }
`;

export const DELETE_AUTHORIZATION = `#graphql
  mutation {
    deleteAuthorization(serviceId: "service-1", managerId: "manager-1")
  }
`;