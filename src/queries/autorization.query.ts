export const GET_SERVICE_AUTHORIZATIONS = `#graphql
query GetServiceAuthorizations($serviceId: UUID!) {
  authorizations: getServiceAuthorizations(serviceId: $serviceId) {
    service {
      id
      name
    }
    manager {
      id
      firstName
      lastName
    }
    isActive
  }
}
`;

export const GET_EMPLOYEE_AUTHORIZATIONS = `#graphql
query GetEmployeeAuthorizations($managerId: UUID!) {
  authorizations : getEmployeeAuthorizations(managerId: $managerId) {
    service {
      id
      name
    }
    manager {
      firstName
      lastName
      id
    }
    isActive
  }
}
`;

export const ADD_AUTHORIZATION = `#graphql
  mutation Mutation($input: NewAuthInput!) {
    addAuthorization(input: $input) {
      message
      success
    }
  }
`

export const UPDATE_AUTHORIZATION = `#graphql
  mutation Mutation($input: UpdateAuthInput!) {
    updateAuthorization(input: $input) {
      message
      success
    }
  }
`

export const DELETE_AUTHORIZATION = `#graphql
  mutation Mutation($input: DeleteAuthInput!) {
    deleteAuthorization(input: $input) {
      message
      success
    }
  }
`;