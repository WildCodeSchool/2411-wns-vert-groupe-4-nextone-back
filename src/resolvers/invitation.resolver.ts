import {
  DeleteResponse,
  Invitation,
  ManagerRole,
  MutationCreateInvitationArgs,
  MutationDeleteInvitationArgs,
  MutationRenewInvitationArgs,
  MutationUpdateInvitationArgs,
  SortedInvitations,
} from "@/generated/graphql";
import InvitationService from "@/services/invitation.service";
import ManagerService from "@/services/manager.service";
import { GraphQLError } from "graphql";
import { MyContext, ResolverWrapper } from "..";
import InvitationEntity from "@/entities/Invitation.entity";
import CompanyService from "@/services/company.service";
import { sendMail } from "@/lib/mail";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";

const invitationResolver = {
  Query: {
    invitation: async (_: any, { id }: { id: string }) => {
      return await InvitationService.getInstance().findById(id);
    },
    invitations: async (_: any, __: any, ctx: MyContext) => {
      const res = await InvitationService.getInstance().findByProperties({
        companyId: ctx.manager?.companyId,
      });
      return res.items;
    },
    sortedInvitations: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<SortedInvitations> => {
      const invitations =
        await InvitationService.getInstance().findByProperties({
          companyId: ctx.manager?.companyId!,
        });
      const sorted: SortedInvitations = {
        expired: [],
        pending: [],
      };
      invitations.items.forEach((invit) => {
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
      const { companyId } = manager!;

      const created = await InvitationService.getInstance().createInvitation(
        args,
        companyId,
      );
      return created;
    },
    updateInvitation: async (
      _: any,
      { args }: MutationUpdateInvitationArgs,
      ctx: MyContext
    ): Promise<Invitation | null> => {
      const invit = await InvitationService.getInstance().findById(args.id);
      if (!invit || invit.companyId !== ctx.manager?.companyId!) {
        throw new GraphQLError("Forbidden.");
      }
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

const isInvitationFromCompany =
  (): ResolverWrapper<MutationRenewInvitationArgs> =>
  (next) =>
  async (root, args, context, info) => {
    await InvitationService.getInstance().checkInvitation(
      args.id,
      context.manager?.companyId!
    );
    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],

  "Mutation.{deleteInvitation, renewInvitation}": [isInvitationFromCompany()],
};

export default composeResolvers(invitationResolver, composition);
