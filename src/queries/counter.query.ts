export const CREATE_COUNTER = `#graphql
mutation CreateCounter($data: CreateCounterInput!) {
  counter: createCounter(data: $data) {
    id
    name
    isAvailable
  }
}
`;

export const UPDATE_COUNTER = `#graphql
mutation UpdateCounter($data: UpdateCounterInput!) {
  counter: updateCounter(data: $data) {
    id
    name
    isAvailable
  }
}
`;

export const DELETE_COUNTER = `#graphql
mutation DeleteCounter($id: UUID!) {
  message: deleteCounter(id: $id) {
    content
    success
  }
}
`;

export const COUNTER = `#graphql
query Counter($counterId: UUID!) {
  counter(counterId: $counterId) {
    id
    name
    isAvailable
  }
}
`;

export const COUNTERS = `#graphql
query Counters {
  counters {
    id
    name
    isAvailable
  }
}
`;

export const ADD_MANAGER_ON_COUNTER = `#graphql
mutation AddManagerOnCounter($data: AddManagerInput!) {
  counter: addManagerOnCounter(data: $data) {
    id
    name
    isAvailable
    manager {
      id
    }
  }
}
`;

export const REMOVE_MANAGER_ON_COUNTER = `#graphql
mutation RemoveManagerOnCounter($id: UUID!) {
  counter: removeManagerOnCounter(id: $id) {
    id
    name
    isAvailable
    manager {
      id
    }
  }
}
`;

export const UPDATE_SERVICES_ON_COUNTER = `#graphql
mutation UpdateServiceOnCounter($data: UpdateCounterServiceInput!) {
  updateServiceOnCounter(data: $data) {
    id
    name
    isAvailable
    services {
      id
    }
  }
}
`
