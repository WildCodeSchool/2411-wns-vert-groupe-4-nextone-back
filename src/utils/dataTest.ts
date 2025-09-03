import {
  GenerateTicketInput,
  CreateCompanyInput,
  InputRegister,
  ManagerRole,
  CreateCounterInput,
  Manager,
  Authorization,
  Company,
  Service,
  ManagerWithoutPassword,
  Status,
  TicketLog,
  Ticket,
} from "@/generated/graphql";

export const fakeTicketInput: GenerateTicketInput = {
  firstName: "Corentin",
  lastName: "Tournier",
  email: "corentin.tournier@gmail.com",
  phone: "0606060606",
  serviceId: "",
};

export const fakeCompanyInput: CreateCompanyInput = {
  name: "Jambonneau CORPORATION",
  address: "38, Rue de la saucisse",
  postalCode: "31000",
  city: "TOULOUSE",
  siret: "362 521 879 00034",
  email: "jambo.no@gmail.com",
  phone: "0123456789",
};

export const fakeManagerInput: InputRegister = {
  password: "test",
  email: "jeanmichel@gmail.com",
  role: ManagerRole.Admin,
  firstName: "jean",
  lastName: "MICHEL",
  companyId: "",
};

export const fakeCompanyDataUpdateInput: CreateCompanyInput = {
  address: "Rue du jambon UP",
  email: "jambonneauUPDATE@gmail.com",
  name: "JambonCorp",
  phone: "0123456789",
  siret: "362 521 879 00089",
  city: "PARIS",
  postalCode: "75000",
};

export const fakeCounterInput: CreateCounterInput = {
  name: "fake counter",
  serviceIdS: [],
  isAvailable: true,
};

export const fakeCompany: Company = {
  id: "f363fd0e-cb52-4089-bc25-75c72112d045",
  name: "Jambonneau CORPORATION",
  address: "38, Rue de la saucisse",
  postalCode: "31000",
  city: "TOULOUSE",
  siret: "362 521 879 00034",
  email: "jambo.no@gmail.com",
  phone: "0123456789",
  createdAt: "2025-07-04T10:46:23.954Z",
  updatedAt: "2025-07-04T10:46:23.954Z",
  services: [],
};

export const fakeService: Service = {
  name: "Radiologie",
  id: "8d106e86-5ffb-4e97-bb3a-cba9a329bbef",
  createdAt: "2025-07-04T10:46:24.023Z",
  updatedAt: "2025-07-04T10:46:24.023Z",
  company: fakeCompany,
  isGloballyActive: true,
};

export const fakeManager: Manager = {
  id: "1f50e0ca-ad6d-461d-b888-9d08c2ad6ff0",
  email: "michelito@gmail.com",
  firstName: "michel",
  lastName: "dedroite",
  password: "testpass",
  role: ManagerRole.Operator,
  isGloballyActive: false,
  company: fakeCompany,
  connectionLogs: [],
  authorizations: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const fakeAuthorization: Authorization = {
  service: fakeService,
  manager: fakeManager,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const fakeManagerWithoutPassword: ManagerWithoutPassword = {
  id: "1",
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  role: ManagerRole.Admin,
  isGloballyActive: true,
  authorizations: [],
  connectionLogs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  company: fakeCompany,
};

export const fakeTickets: Ticket[] = [
  {
    id: "a78324f0-3f44-4f7e-943a-a09466def978",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Pending,
    service: fakeService,
    ticketLogs: [],
  },
  {
    id: "00eec0d2-0082-4067-8e83-d13a47b55525",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Created,
    service: fakeService,
    ticketLogs: [],
  },
  {
    id: "12a75dd6-c9af-403a-a537-b4634424c85d",
    code: "999",
    firstName: "test",
    email: "touf@gmail.com",
    lastName: "testest",
    phone: "0606060606",
    status: Status.Done,
    service: fakeService,
    ticketLogs: [],
  },
];

export const fakeTicketLog: TicketLog = {
  id: "d029957b-7cf2-4c8f-ae4d-ff748e190751",
  createdAt: "2025-06-25T14:28:03.726Z",
  status: Status.Pending,
  updatedAt: "2025-06-25T14:41:40.023Z",
  manager: fakeManagerWithoutPassword,
  ticket: fakeTickets[0],
};

export const fakeData: Partial<TicketLog>[] = [
  {
    id: "f6f368bf-1e98-49d8-92cb-2f2a2d9b33b8",
    status: Status.Created,
    manager: fakeManagerWithoutPassword,
    ticket: fakeTickets[0],
  },
  {
    id: "f5dfa9d0-e5d9-4f9b-99aa-438c517c8390",
    status: Status.Created,
    manager: fakeManagerWithoutPassword,
    ticket: fakeTickets[1],
  },
  {
    id: "2b43610f-8e88-4201-859e-928a3fb8cb73",
    status: Status.Created,
    manager: fakeManagerWithoutPassword,
    ticket: fakeTickets[0],
  },
];
