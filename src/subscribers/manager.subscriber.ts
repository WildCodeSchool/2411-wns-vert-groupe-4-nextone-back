import InvitationEntity from "@/entities/Invitation.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";

@EventSubscriber()
export default class ManagerSubscriber
  implements EntitySubscriberInterface<ManagerEntity>
{
  listenTo(): Function | string {
    return ManagerEntity;
  }

  public async afterInsert(event: InsertEvent<ManagerEntity>): Promise<void> {
    const { email } = event.entity
    await event.manager.delete(InvitationEntity, {email})
  }

}
