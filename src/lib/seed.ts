import CompanyEntity from "@/entities/Company.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { ServiceEntity } from "@/entities/Service.entity";
import { InputRegister, ManagerRole } from "@/generated/graphql";
import CompanyService from "@/services/company.service";
import ManagerService from "@/services/manager.service";
import ServicesService from "@/services/services.service";
import { faker } from "@faker-js/faker";

const createCompanyAndSuperAdmin = async (): Promise<CompanyEntity> => {
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
      const created = await new ServicesService().createService(service);
      return created;
    })
  );

  return services;
};

const createManagers = async (
  services: ServiceEntity
): Promise<ManagerEntity[]> => {
  const createRandomUser = (): InputRegister => {
    return {
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      password: "salami",
      role: ManagerRole.Admin,
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
  services.map(async (service) => {
    managers.map(async (manager) => {
      const random = Math.random()
      if (random > 0.5) {
        await new ServicesService().updateService(service.id, {
          
        })
      }
    })
  })
};
