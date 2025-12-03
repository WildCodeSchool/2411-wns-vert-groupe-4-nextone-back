import InvitationEntity from "@/entities/Invitation.entity";
import BaseService from "./base.service";
import {
  createInvitationToken,
  createTokenAndExpiration,
} from "@/utils/tokens.utils";
import { GraphQLError } from "graphql";

export default class InvitationService extends BaseService<InvitationEntity> {
  private static instance: InvitationService | null = null;

  private constructor() {
    super(InvitationEntity);
  }

  public static getInstance() {
    if (this.instance === null) {
      this.instance = new InvitationService();
    }
    return this.instance;
  }

  public async renewInvitation(id: string): Promise<InvitationEntity> {
    const invitation = await this.findById(id);
    if (!invitation) {
      throw new Error(
        "Impossible de trouver l'invitation avec l'id renseigné."
      );
    }
    const { token, expiration } = createTokenAndExpiration(24 * 60);
    invitation.token = token;
    invitation.tokenExpiration = new Date(expiration);
    this.repo.save(invitation);
    return invitation;
  }

  public async checkInvitation(
    invitationId: string,
    companyId: string
  ): Promise<void> {
    const invit = await this.repo.findOne({
      where: {
        id: invitationId,
      },
    });
    if (invit?.companyId !== companyId) {
      throw new GraphQLError("Forbidden.");
    }
  }
}
