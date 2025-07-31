export const COMPANIES = `#graphql
  query companies { 
    companies {
      id
      name
    }
  }
`;

export const COMPANY_BY_ID = `#graphql
  query company($id: ID!) {
    company(id: $id) {
      id
      name
    }
  } 
`;

export const CREATE_COMPANY = `#graphql
  mutation CreateCompany($data: CreateCompanyInput!) {
    company: createCompany(data: $data) {
      id
      name
    }
  }
`;

export const CREATE_COMPANY_DB = `#graphql
mutation CreateCompany($data: CreateCompanyInput!) {
  company: createCompany(data: $data) {
    id
    name
    address
    postalCode
    city
    siret
    email
    phone
  }
}
`;

export const DELETE_COMPANY = `#graphql
  mutation DeleteCompany($id: ID!) {
    message : deleteCompany(id: $id) {
      message
      success
    }
  }
`;

export const UPDATE_COMPANY = `#graphql
mutation UpdateCompany($data: UpdateCompanyInput!) {
  updateCompany(data: $data) {
    id
    name
  }
}
`;

export const UPDATE_COMPANY_DB = `#graphql
mutation UpdateCompany($data: UpdateCompanyInput!) {
  company: updateCompany(data: $data) {
     name
    address
    email
    phone
    siret
    id
    city
    postalCode
  }
}
`;
