import CompanyEntity from "@/entities/Company.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import TicketEntity from "@/entities/Ticket.entity";
import {
  CreateServiceInput,
  ManagerRole,
  Status,
  UpdateStatusTicketInput,
} from "@/generated/graphql";
import AuthorizationService from "@/services/authorization.service";
import CompanyService from "@/services/company.service";
import ManagerService from "@/services/manager.service";
import ServicesService from "@/services/services.service";
import TicketService from "@/services/ticket.service";
// import { fakerFR as faker } from "@faker-js/faker";
import datasource from "./datasource";
import { DeepPartial } from "typeorm";

const MANAGER_COUNT = 100;
const TICKET_COUNT = 500;

const createCompanyAndSuperAdmin = async (): Promise<CompanyEntity[]> => {
  console.log("🏚️ --> CREATION DE LA COMPANY...");
  const company = new CompanyEntity();
  company.name = "Apple Premium Partner";
  company.address = "57 Rue d'Alsace Lorraine";
  company.postalCode = "31000";
  company.city = "TOULOUSE";
  company.siret = "362 521 879 00728";
  company.email = "contact@apple.com";
  company.phone = "0581185252";

  const google = new CompanyEntity();
  google.name = "Google France";
  google.address = "89, rue de Londres";
  google.postalCode = "75009";
  google.city = "PARIS";
  google.siret = "362 521 879 00034";
  google.email = "support@google.com";
  google.phone = "0142685300";

  const nextOne = new CompanyEntity();
  nextOne.id = process.env.NEXTONE_COMPANY_ID!;
  nextOne.name = "NextONE";
  nextOne.address = "52, Avenue de la rigole";
  nextOne.postalCode = "31000";
  nextOne.city = "TOULOUSE";
  nextOne.siret = "362 521 879 00089";
  nextOne.email = "contact@nextone.com";
  nextOne.phone = "0134562347";

  const created = await CompanyService.getService().createOne(company);
  const created2 = await CompanyService.getService().createOne(google);
  const created3 = await CompanyService.getService().createOne(nextOne);

  const appleAdmin = new ManagerEntity();
  appleAdmin.firstName = "contact";
  appleAdmin.lastName = "apple";
  appleAdmin.companyId= created.id
  appleAdmin.email = "contact@apple.com";
  appleAdmin.role = ManagerRole.SuperAdmin;
  appleAdmin.password = "nextone";

  const managerService = new ManagerService()

  await managerService.create(appleAdmin);
  
  const googleAdmin = new ManagerEntity();
  googleAdmin.firstName = "support";
  googleAdmin.lastName = "google";
  googleAdmin.companyId = created2.id
  googleAdmin.email = "support@google.com";
  googleAdmin.role = ManagerRole.SuperAdmin;
  googleAdmin.password = "nextone";

  await managerService.create(googleAdmin);

  await createNextOneAdmin(created3);

  return [created, created2];
};

const createNextOneAdmin = async (company: CompanyEntity): Promise<void> => {
  const users = [
    ["Corentin", "TOURNIER"],
    ["Oceane", "BERTRAND"],
    ["Maeva", "RODRIGUES"],
    ["William", "MIBELLI"],
  ] as const;

  await Promise.all(
    users.map(async (u) => {
      const [firstname, lastname] = u;
      const user = new ManagerEntity();
      user.firstName = firstname;
      user.lastName = lastname;
      user.companyId = company.id;
      user.role = ManagerRole.NextoneAdmin;
      user.email = `${firstname.toLowerCase()}.${lastname.toLowerCase()}@nextone.com`;
      user.password = "nextone";
      user.isGloballyActive = true;

      await new ManagerService().create(user);
    })
  );
};

const createServices = async (
  companies: CompanyEntity[]
): Promise<ServiceEntity[]> => {
  console.log("🐤 --> CREATION DES SERVICES...");
  const serviceNames: string[] = [
    "Accueil",
    "SAV",
    "Buvette",
    "Comptoir",
    "Réparation",
    "Pièces détachées",
    "Atelier",
  ];
  const res = await Promise.all(
    companies.map(async (company) => {
      const admin = await new ManagerService().db.findOne({
        where: {
          companyId: company.id
        }
      })
      if (!admin) {
        throw new Error(`Can't find admin for ${company.name}`)
      }
      const serviceService = new ServicesService()
      const services = await Promise.all(
        serviceNames.map(async (name) => {
          const data: CreateServiceInput = {
            companyId: company.id,
            name: `${company.name.split(" ")[0].toUpperCase()}_${name}`,
          };
          const created = await serviceService.createService(data);
          const authorization = await new AuthorizationService().addAuthorization({
            isAdministrator: true,
            managerId: admin.id,
            serviceId: created.id
          }, admin)
          if (!authorization) {
            throw new Error(`Unable to add authorization for user ${admin.email} in service ${created.name}`)
          }
          return created;
        })
      );
      return services;
    })
  );

  return res.flat(1);
};

const createManagers = async (
  companies: CompanyEntity[]
): Promise<ManagerEntity[]> => {
  console.log("⛹️ --> CREATION DES MANAGERS...");
  const { fakerFR: faker } = await import("@faker-js/faker");
  const createRandomUser = (): DeepPartial<ManagerEntity> => {
    return {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: "salami",
      role: Math.random() > 0.7 ? ManagerRole.Admin : ManagerRole.Operator,
      companyId: companies[Math.random() > 0.5 ? 0 : 1].id,
    };
  };

  const users = faker.helpers.multiple(createRandomUser, {
    count: MANAGER_COUNT,
  });

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
  console.log("🤝 --> ASSIGNATION DES MANAGERS DANS LES SERVICES...");

  services.map(async (service) => {
    managers.map(async (manager) => {
      const random = Math.random();
      const superAdmin = await new ManagerService().db.findOne({
        where: {
          companyId: manager.companyId,
          role: ManagerRole.SuperAdmin,
        },
      });
      if (!superAdmin) {
        throw new Error("Can't find Super Admin.");
      }
      if (random > 0.5) {
        await new AuthorizationService().addAuthorization(
          {
            managerId: manager.id,
            serviceId: service.id,
          },
          superAdmin
        );
      }
    });
  });
};

const createTicket = async (
  services: ServiceEntity[]
): Promise<TicketEntity[]> => {
  console.log("🎫 --> CREATION DES TICKETS...");
  const { fakerFR: faker } = await import("@faker-js/faker");
  const dateMin = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).getTime()
  const dateMax = Date.now()
  const createRandomTicket = () => {
    const randomIndex = Math.floor(Math.random() * services.length);
    const service = services[randomIndex];
    // console.log('SERVICEID : ', serviceId)
    const randomTicket: DeepPartial<TicketEntity> = {
      // code: faker.number.int({ max: 999 }).toString().padStart(3, "0"),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      service,
      createdAt: faker.date.between({ from: dateMin, to: dateMax})
    };
    return randomTicket;
  };

  const randomTickets = faker.helpers.multiple(createRandomTicket, {
    count: TICKET_COUNT,
  });

  const tickets: TicketEntity[] = [];
  for (let i = 0; i < randomTickets.length; i++) {
    const ticket = await TicketService.gettInstance().createOne(
      randomTickets[i]
    );
    tickets.push(ticket);
  }

  return tickets;
};


const updateTicketStatus = async (
  managers: ManagerEntity[],
  tickets: TicketEntity[]
) => {
  console.log("💄 --> MISE A JOUR DES TICKETS");
  let j = 1;
  for (let i = 0; i < 100; i++) {
    const ticket = tickets[Math.floor(Math.random() * tickets.length)];
    const manager = managers[Math.floor(Math.random() * managers.length)];
    let status: Status = Status.Inprogress;
    switch (j) {
      case 1:
        status = Status.Inprogress;
        break;
      case 2:
        status = Status.Canceled;
        break;
      case 3:
        j = 0;
        status = Status.Done;
        break;
      default:
        status = Status.Archived;
    }
    j++;
    const data: UpdateStatusTicketInput = {
      id: ticket.id,
      status,
    };
    await TicketService.gettInstance().updateTicketStatus(data, manager);
  }
};

const initializeDataSource = async () => {
  console.log("📅 --> INITIALISATION DE LA BASE DE DONNEE");
  if (!datasource.isInitialized) {
    await datasource.initialize();
  }
  await datasource.query(
    "TRUNCATE company, service, manager, ticketlog, authorizations, ticket, setting CASCADE"
  );
};

export const seedDB = async (): Promise<void> => {
  try {
    console.log("-------------------");
    console.log("🚀 DEBUT DU SEEDING ...");
    console.log("-------------------");

    await initializeDataSource();

    const companies = await createCompanyAndSuperAdmin();
    const services = await createServices(companies);
    const managers = await createManagers(companies);
    await assignManagersToService(managers, services);
    // await createCounter(services)
    const tickets = await createTicket(services);
    await updateTicketStatus(managers, tickets);

    console.log("🥳 --> SEEDING OK.");
  } catch (error: any) {
    console.log("-------------------");
    console.log("😭 --> ERREUR DANS LE SEEDING...");
    console.log("-------------------");
    console.log("😡 L'ERREUR : ", error?.message);
    // exit(0)
  }
};

if (require.main === module) {
  seedDB();
}
//DANS DOCKER

//npx ts-node -r tsconfig-paths/register src/lib/seed.ts
