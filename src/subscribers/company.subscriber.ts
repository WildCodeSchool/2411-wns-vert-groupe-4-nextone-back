import CompanyEntity from "@/entities/Company.entity";
import InvitationEntity from "@/entities/Invitation.entity";
import { ManagerRole } from "@/generated/graphql";
import { sendMail } from "@/lib/mail";
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

    //CREATION D'UNE INVITATION
    const { email } = event.entity;

    const invitation = new InvitationEntity()
    invitation.email = email
    invitation.role = ManagerRole.SuperAdmin
    invitation.company = event.entity

    const savedInvitation = await event.manager.save(invitation)

    await sendMail(savedInvitation.email, savedInvitation.token, "CREATE_INVITATION")

  }
}
