export const GET_SERVICE_AUTHORIZATIONS = `#graphql
  query {
    getServiceAuthorizations(serviceId: "service-1") {
      serviceId
      managerId
      isActive
    }
  }
`;

export const GET_EMPLOYEE_AUTHORIZATIONS = `#graphql
  query {
    getEmployeeAuthorizations(managerId: "manager-1") {
      serviceId
      managerId
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