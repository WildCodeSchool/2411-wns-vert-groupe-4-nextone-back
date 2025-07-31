import CompanyEntity from "@/entities/Company.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { ManagerRole } from "@/generated/graphql";
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";

@EventSubscriber()
export default class CompanySubscriber
  implements EntitySubscriberInterface<CompanyEntity>
{
  listenTo() {
    return CompanyEntity;
  }

  public async afterInsert(event: InsertEvent<CompanyEntity>): Promise<void> {
    //CREATION D'UN SUPER ADMIN POUR LA COMPANY
    const { email, name } = event.entity;

    const admin = new ManagerEntity();
    admin.email = email;
    admin.role = ManagerRole.SuperAdmin;
    admin.password = "saucisson";
    admin.firstName = name;
    admin.lastName = name;
    admin.company = event.entity
    admin.isGloballyActive = true;

    await event.manager.save(admin);
  }
}
