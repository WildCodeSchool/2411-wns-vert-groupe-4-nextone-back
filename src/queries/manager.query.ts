export const LIST_MANAGERS = `#graphql
  query Managers {
    managers {
      email
      id
      is_globally_active
    }
  }
`;

export const REGISTER_MANAGER = `#graphql
  mutation createManager($infos: InputRegister!) {
    createManager(infos: $infos) {
      email
      first_name
      id
      is_globally_active
      last_name
      role
    }
  }
`;

export const LOGIN_MANAGER = `#graphql
  query login($infos: InputLogin!) {
    login(infos: $infos) {
      manager {
        id
        first_name
        last_name
        email
        role
        is_globally_active
        created_at
        updated_at
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
      first_name
      last_name
      email
      role
      is_globally_active
      created_at
      updated_at
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
  mutation updateManager($updateManagerId: ID!, $data: UpdateManagerInput!) {
    updateManager(id: $updateManagerId, data: $data) {
      id
      first_name
      last_name
      email
      role
      is_globally_active
      created_at
      updated_at
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