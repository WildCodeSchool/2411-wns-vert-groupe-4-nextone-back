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

  public async afterInsert(event: InsertEvent<CompanyEntity>) {
    //CREATION D'UN SUPER ADMIN POUR LA COMPANY
    const { email, name } = event.entity;

    const admin = new ManagerEntity();
    admin.email = email;
    admin.role = ManagerRole.SuperAdmin;
    admin.password = "jambonneau";
    admin.first_name = name;
    admin.last_name = name;
    admin.company = event.entity
    admin.is_globally_active = true;

    const saved = await event.manager.save(admin);
    console.log("SUPER ADMIN CREATED");
  }
}
