export const TICKETLOGS = `#graphql
  query TicketLogs {
  ticketLogs {
    id
  }
}
`;

export const TICKETLOG = `#graphql
query TicketLog($id: UUID!) {
  ticketLog(id: $id) {
    id
    ticket {
      id
      code
      email
      lastName
      firstName
      phone
      status
    }
    manager {
      id
      email
      first_name
      last_name
      role
      is_globally_active
    }
    status
  }
}
`;

export const TICKETLOG_BY_PROPERTY = `#graphql
query TicketLogsByProperty($field: TicketLogPropertyInput!) {
  ticketLogsByProperty(field: $field) {
    id
    ticketId
    managerId
    status
  }
}
`;

export const CREATE_TICKETLOG = `#graphql
mutation CreateTicketLog($data: CreateTicketLogInput!) {
  ticketLog: createTicketLog(data: $data) {
    id
  }
}
`;

export const UPDATE_TICKETLOG = `#graphql
mutation UpdateTicketLog($data: UpdateTicketLogInput!) {
  ticketLog: updateTicketLog(data: $data) {
    id
    status
    ticket {
      id
    }
  }
}
`;

export const DELETE_TICKETLOG = `#graphql
mutation DeleteTicketLog($id: UUID!) {
  message: deleteTicketLog(id: $id) {
    message
    success
  }
}
`;
