import InvitationEntity from "@/entities/Invitation.entity";
import datasource from "@/lib/datasource";
import { Repository } from "typeorm";


export default class InvitationRepository extends Repository<InvitationEntity> {
  constructor() {
    super(InvitationEntity, datasource.createEntityManager())
  }
}