import AuthorizationService from "@/services/authorization.service";
import {
  MutationAddAuthorizationArgs,
  MutationUpdateAuthorizationArgs,
  MutationDeleteAuthorizationArgs,
  QueryGetEmployeeAuthorizationsArgs,
  QueryGetServiceAuthorizationsArgs,
  AuthorizationResponse,
} from "@/generated/graphql";
import { MyContext } from "..";
import { buildResponse } from "@/utils/authorization";
import ServicesService from "@/services/services.service";
import AuthorizationEntity from "@/entities/Authorization.entity";
import ManagerService from "@/services/manager.service";

const authorizationService = new AuthorizationService();

export default {
  Query: {
    getServiceAuthorizations: async (
      _: any,
      { serviceId }: QueryGetServiceAuthorizationsArgs,
      ctx: MyContext
    ) => {
      return await authorizationService.getByService(serviceId);
    },

    getEmployeeAuthorizations: async (
      _: any,
      { managerId }: QueryGetEmployeeAuthorizationsArgs,
      ctx: MyContext
    ) => {
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
  },
  Authorization: {
    service: async (parent: AuthorizationEntity,_: any, { loaders: { serviceLoader }}: MyContext) => {
      return await serviceLoader.load(parent.serviceId)
    },
    manager: async (parent: AuthorizationEntity,_: any, { loaders: { managerLoader }}: MyContext) => {
      return await managerLoader.load(parent.managerId)
    },
  },
};
