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
      firstName
      lastName
      role
      isGloballyActive
    }
    status
  }
}
`;

export const TICKETLOG_ID = `#graphql
query TicketLog($id: UUID!) {
  ticketLog(id: $id) {
    id
  }
}
`;

// export const TICKETLOGS_BY_PROPERTIES = `#graphql
// query TicketLogsByProperties($fields: TicketLogPropertiesInput!) {
//   ticketLogsByProperties(fields: $fields) {
//     id
//     ticket {
//       id
//       firstName
//       lastName
//     }
//     status
//   }
// }
// `;

export const TICKETLOG_BY_PROPERTY = `#graphql
query TicketLogsByProperty($field: TicketLogPropertyInput!) {
  ticketLogs: ticketLogsByProperty(field: $field) {
    id
    status
    ticket {
      id
      firstName
      lastName
    }
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
