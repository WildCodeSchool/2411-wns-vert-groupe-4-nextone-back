export const LIST_TICKETS = `#graphql
    query getTickets {
      getTickets {
        id
        code
      }
    }
`;

export const GENERATE_TICKET = `#graphql
    mutation generateTicket($data: GenerateTicketInput!) {
      generateTicket(data: $data) {
        id
        firstName
        lastName
        email
        phone
        code
      }
    }
`;

export const FIND_TICKET_BY_ID = `#graphql
    query getTicket($getTicketId: ID!) {
      getTicket(id: $getTicketId) {
        code
      }
    }
`;

export const DELETE_TICKET = `#graphql
    mutation deleteTicket($deleteTicketId: ID!) {
      deleteTicket(id: $deleteTicketId) {
        message
        success
      }
}
`;

export const UPDATE_TICKET = `#graphql
    mutation updateTicket($data: UpdateTicketInput!) {
      updateTicket(data: $data) {
        code
        id
        firstName
        lastName
        email
        phone
        status
      }
}
`;