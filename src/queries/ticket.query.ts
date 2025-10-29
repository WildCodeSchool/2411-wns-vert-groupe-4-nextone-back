export const LIST_TICKETS = `#graphql
      query tickets($pagination: PaginationInput) {
        tickets(pagination: $pagination) {
          items {
            id
            code
          }
          totalCount
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
    query ticket($getTicketId: ID!) {
      ticket(id: $getTicketId) {
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

// PAGINATION
export const TICKETS_BY_PROPERTIES = `#graphql
    query ticketsByProperties($fields: TicketPropertiesInput, $pagination: PaginationInput) {
      ticketsByProperties(fields: $fields, pagination: $pagination) {
        items {
          id
          code
          status
          createdAt
        }
        totalCount
      }
    }
`;