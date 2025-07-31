import CompanyEntity from "@/entities/Company.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import TicketEntity from "@/entities/Ticket.entity";
import { GenerateTicketInput, InputRegister, ManagerRole } from "@/generated/graphql";
import AuthorizationService from "@/services/authorization.service";
import CompanyService from "@/services/company.service";
import ManagerService from "@/services/manager.service";
import ServicesService from "@/services/services.service";
import TicketService from "@/services/ticket.service";
import { fakerFR as faker } from "@faker-js/faker";
import datasource from "./datasource";

const createCompanyAndSuperAdmin = async (): Promise<CompanyEntity> => {
  console.log('🏚️ --> CREATION DE LA COMPANY...')
  const company = new CompanyEntity();
  company.name = "Jambonneau CORPORATION";
  company.address = "38, Rue de la saucisse";
  company.postalCode = "31000";
  company.city = "TOULOUSE";
  company.siret = "362 521 879 00034";
  company.email = "jambo.no@gmail.com";
  company.phone = "0123456789";

  const created = await CompanyService.getService().createOne(company);

  return created;
};

const createServices = async (
  company: CompanyEntity
): Promise<ServiceEntity[]> => {
  console.log("🐤 --> CREATION DES SERVICES...")
  const serviceNames: string[] = [
    "Accueil",
    "SAV",
    "Buvette",
    "Comptoir",
    "Four",
  ];
  const services = await Promise.all(
    serviceNames.map(async (name) => {
      const service = new ServiceEntity();
      service.name = name;
      service.company = company;
      service.companyId = company.id
      const created = await new ServicesService().createService(service);
      return created;
    })
  );

  return services;
};

const createManagers = async (company: CompanyEntity): Promise<ManagerEntity[]> => {
  console.log("⛹️ --> CREATION DES MANAGERS...")
  const createRandomUser = (): InputRegister => {
    return {
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: "salami",
      role: ManagerRole.Admin,
      companyId: company.id
    };
  };

  const users = faker.helpers.multiple(createRandomUser, { count: 20 });

  const managers = await Promise.all(
    users.map(async (user) => {
      const created = await new ManagerService().create(user);
      return created;
    })
  );

  return managers;
};

const assignManagersToService = async (
  managers: ManagerEntity[],
  services: ServiceEntity[]
) => {

  console.log("🤝 --> ASSIGNATION DES MANAGERS DANS LES SERVICES...")
  const superAdmin = await new ManagerService().findManagerByEmail("jambo.no@gmail.com")

  if (!superAdmin) {
    throw new Error("Can't find super admin.");
  }

  services.map(async (service) => {
    managers.map(async (manager) => {
      const random = Math.random()
      if (random > 0.5) {
        await new AuthorizationService().addAuthorization({
          managerId: manager.id,
          serviceId: service.id
        }, superAdmin)
      }
    })
  })
};

const createTicket = async (): Promise<TicketEntity[]> => {
  console.log("🎫 --> CREATION DES TICKETS...")
  const createRandomTicket = () => {
    const randomTicket: GenerateTicketInput = {
      code: faker.number.int({ max: 999 }).toString().padStart(3, "0"),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number()
    }
    return randomTicket
  }

  const randomTickets = faker.helpers.multiple(createRandomTicket, { count: 50 });

  const tickets = await Promise.all(
    randomTickets.map(async (ticket) => {
      return await TicketService.gettInstance().createOne(ticket)
    })
  )

  return tickets
}

const initializeDataSource = async () => {
  console.log("📅 --> INITIALISATION DE LA BASE DE DONNEE")
  if (!datasource.isInitialized) {
    await datasource.initialize()
  }
  await datasource.query("TRUNCATE company, service, manager, ticketlog, authorizations, ticket, setting CASCADE")
}

export const seedDB = async(): Promise<boolean> => {
  try {
    console.log("-------------------")
    console.log("🚀 DEBUT DU SEEDING ...")
    console.log('-------------------')
    await initializeDataSource()
    const company = await createCompanyAndSuperAdmin()
    const services = await createServices(company);
    const managers = await createManagers(company)
    await assignManagersToService(managers, services)
    const tickets = await createTicket()
    console.log("🥳 --> SEEDING OK.")
    return true
  } catch (error: any) {
    console.log("😭 --> ERREUR DANS LE SEEDING...");
    console.log(error?.message);
    return false
  }

}

if (require.main === module) {
  seedDB()
}
//DANS DOCKER

//npx ts-node -r tsconfig-paths/register src/lib/seed.ts
