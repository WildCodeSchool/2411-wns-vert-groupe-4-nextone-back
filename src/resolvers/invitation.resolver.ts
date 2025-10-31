import {
  DeleteResponse,
  Invitation,
  MutationCreateInvitationArgs,
  MutationDeleteInvitationArgs,
  MutationRenewInvitationArgs,
  MutationUpdateInvitationArgs,
  SortedInvitations,
} from "@/generated/graphql";
import InvitationService from "@/services/invitation.service";
import ManagerService from "@/services/manager.service";
import { GraphQLError } from "graphql";
import { MyContext } from "..";
import InvitationEntity from "@/entities/Invitation.entity";
import CompanyService from "@/services/company.service";
import { sendMail } from "@/lib/mail";

export default {
  Query: {
    invitation: async (_: any, { id }: { id: string }) => {
      return await InvitationService.getInstance().findById(id);
    },
    invitationByToken: async (_: any, { token }: { token: string }) => {
      return await InvitationService.getInstance().findByToken(token);
    },
    invitations: async () => {
      return await InvitationService.getInstance().findAll();
    },
    sortedInvitations: async (): Promise<SortedInvitations> => {
      const invitations = await InvitationService.getInstance().findAll();
      const sorted: SortedInvitations = {
        expired: [],
        pending: [],
      };
      invitations.forEach((invit) => {
        const now = Date.now();
        if (now < invit.tokenExpiration.getTime()) {
          return sorted.pending.push(invit);
        } else {
          return sorted.expired.push(invit);
        }
      });
      return sorted;
    },
  },
  Mutation: {
    createInvitation: async (
      _: any,
      { args }: MutationCreateInvitationArgs,
      { manager }: MyContext
    ): Promise<Invitation> => {
      if (!manager) {
        throw new GraphQLError("NOT LOGGED IN", {
          extensions: {
            type: "AUTH_ERROR",
          },
        });
      }
      const existingEmail = await new ManagerService().findManagerByEmail(
        args.email
      );
      if (existingEmail) {
        throw new GraphQLError("Cette adresse email n'est pas disponible.", {
          extensions: {
            type: "EMAIL_ALREADY_USED",
          },
        });
      }
      const { companyId } = manager;
      const created = await InvitationService.getInstance().createOne({
        ...args,
        companyId,
      });
      const mail = await sendMail(
        created.email,
        created.token,
        "CREATE_INVITATION"
      );
      return created;
    },
    updateInvitation: async (
      _: any,
      { args }: MutationUpdateInvitationArgs
    ): Promise<Invitation | null> => {
      const { id, ...rest } = args;
      const updated = await InvitationService.getInstance().updateOne(id, rest);
      return updated;
    },
    renewInvitation: async (
      _: any,
      { id }: MutationRenewInvitationArgs
    ): Promise<Invitation> => {
      const renew = await InvitationService.getInstance().renewInvitation(id);
      const sentMail = await sendMail(
        renew.email,
        renew.token,
        "RENEW_INVITATION"
      );
      return renew;
    },
    deleteInvitation: async (
      _: any,
      { id }: MutationDeleteInvitationArgs
    ): Promise<DeleteResponse> => {
      const deleted = await InvitationService.getInstance().deleteOne(id);
      const response: DeleteResponse = {
        success: deleted,
        message: deleted
          ? "Invitation supprimée."
          : "Impossible de supprimer l'invitation",
      };
      return response;
    },
  },
  Invitation: {
    company: async (parent: InvitationEntity, _: any, context: MyContext) => {
      const company = await CompanyService.getService().findById(
        context.manager?.companyId!
      );
      return company;
    },
  },
};
