import AuthorizationService from "@/services/authorization.service";
import {
  MutationAddAuthorizationArgs,
  MutationUpdateAuthorizationArgs,
  MutationDeleteAuthorizationArgs,
  QueryGetEmployeeAuthorizationsArgs,
  QueryGetServiceAuthorizationsArgs,
  AuthorizationResponse,
} from "@/generated/graphql";
import { MyContext, ResolverWrapper } from "..";
import { buildResponse } from "@/utils/authorization";
import AuthorizationEntity from "@/entities/Authorization.entity";
import ServicesService from "@/services/services.service";
import ManagerService from "@/services/manager.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";


const authorizationService = new AuthorizationService();

const authorizationResovler = {
  Query: {
    getServiceAuthorizations: async (
      _: any,
      { serviceId }: QueryGetServiceAuthorizationsArgs,
      ctx: MyContext
    ) => {
      await new ServicesService().checkService(serviceId, ctx.manager?.companyId!)

      return await authorizationService.getByService(serviceId);
    },

    getEmployeeAuthorizations: async (
      _: any,
      { managerId }: QueryGetEmployeeAuthorizationsArgs,
      ctx: MyContext
    ) => {
      await new ManagerService().checkManager(managerId, ctx.manager?.companyId!)
      return await authorizationService.getByManager(managerId);
    },
  },

  Mutation: {
    addAuthorization: async (
      _: any,
      { input }: MutationAddAuthorizationArgs,
      { manager }: MyContext
    ): Promise<AuthorizationResponse> => {
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const success = await authorizationService.addAuthorization(
        input,
        manager
      );
      return buildResponse(
        success,
        "Authorization successfully created.",
        "Authorization already exists."
      );
    },

    updateAuthorization: async (
      _: any,
      { input }: MutationUpdateAuthorizationArgs,
      { manager }: MyContext
    ): Promise<AuthorizationResponse> => {
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const success = await authorizationService.updateAuthorization(
        input,
        manager
      );
      return buildResponse(
        success,
        "Authorization updated successfully.",
        "Authorization update failed."
      );
    },

    deleteAuthorization: async (
      _: any,
      { input }: MutationDeleteAuthorizationArgs,
      { manager }: MyContext
    ): Promise<AuthorizationResponse> => {
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const success = await authorizationService.deleteAuthorization(
        input,
        manager
      );
      return buildResponse(
        success,
        "Authorization deleted successfully.",
        "Authorization not found or already deleted."
      );
    },

    addBulkAuthorization: async (
      _: any,
      { input }: MutationAddAuthorizationArgs,
      { manager }: MyContext
    ): Promise<AuthorizationResponse> => {
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const success = await authorizationService.addAuthorization(
        input,
        manager
      );
      return buildResponse(
        success,
        "Authorizations successfully created.",
        "Authorizations already exist."
      );
    },
  },
  Authorization: {
    service: async (parent: AuthorizationEntity) => {
      return await new ServicesService().db.findOne({
        where: {
          authorizations: {
            serviceId: parent.serviceId,
          },
        },
      });
    },
    manager: async (parent: AuthorizationEntity) => {
      return await new ManagerService().getManagerById(parent.managerId);
    },
  },
};

const isFromCompany =
  (): ResolverWrapper<MutationUpdateAuthorizationArgs> =>
  (next) =>
  async (root, args, context, info) => {
    await new ServicesService().checkService(args.input.serviceId, context.manager?.companyId!)
    await new ManagerService().checkManager(args.input.managerId, context.manager?.companyId!)
    return next(root, args, context, info);
  };

const composition = {
  "Query.*": [isAuthenticated()],
  "Mutation.*": [isAuthenticated(), isFromCompany()],
};

export default composeResolvers(authorizationResovler, composition);
