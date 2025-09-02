export const LIST_MANAGERS = `#graphql
  query Managers {
    managers {
      email
      id
      isGloballyActive
      authorizations {
        isActive
        createdAt
      }
    }
  }
`;

export const REGISTER_MANAGER = `#graphql
  mutation createManager($infos: InputRegister!) {
    createManager(infos: $infos) {
      email
      firstName
      id
      isGloballyActive
      lastName
      role
    }
  }
`;

export const LOGIN_MANAGER = `#graphql
  query login($infos: InputLogin!) {
    login(infos: $infos) {
      manager {
        id
        firstName
        lastName
        email
        role
        isGloballyActive
        createdAt
        updatedAt
      }
      token
    }
  }
`

export const LOGOUT_MANAGER = `#graphql
  query Logout {
    logout {
      message
      success
    }
  }
`

export const FIND_MANAGER_BY_ID = `#graphql
  query manager($managerId: ID!) {
    manager(id: $managerId) {
      id
      firstName
      lastName
      email
      role
      isGloballyActive
      createdAt
      updatedAt
    }
  }
`

export const DELETE_MANAGER = `#graphql
  mutation DeleteManager($deleteManagerId: ID!) {
    deleteManager(id: $deleteManagerId) {
      message
      success
    }
  }
`

export const UPDATE_MANAGER = `#graphql
  mutation updateManager($id: ID!, $data: UpdateManagerInput!) {
    updateManager(id: $id, data: $data) {
      id
      firstName
      lastName
      email
      role
      isGloballyActive
      createdAt
      updatedAt
    }
  }
`

export const TOGGLE_GLOBAL_ACCESS_MANAGER = `#graphql
  mutation Mutation($toggleGlobalAccessManagerId: UUID!) {
    toggleGlobalAccessManager(id: $toggleGlobalAccessManagerId) {
      success
      message
    }
  }
`