

export const SETTINGS = `#graphql
query Settings {
  settings {
    id
    name
  }
}
`;

export const SETTING = `#graphql
query Setting($id: ID!) {
  setting(id: $id) {
    id
    name
  }
}
`;

export const DELETE_SETTING = `#graphql
mutation DeleteSetting($id: ID!) {
  message: deleteSetting(id: $id) {
    content
    success
  }
}
`;

export const UPDATE_SETTING = `#graphql
mutation UpdateSetting($data: UpdateSettingInput!) {
  setting: updateSetting(data: $data) {
    id
    name
  }
}
`;

export const CREATE_SETTING = `#graphql
mutation CreateSetting($data: CreateSettingInput!) {
  setting: createSetting(data: $data) {
    id
    name
  }
}
`;
