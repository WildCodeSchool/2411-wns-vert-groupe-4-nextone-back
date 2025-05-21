import AuthorizationService from "@/services/authorization.service";
import {
  MutationAddAuthorizationArgs,
  MutationUpdateAuthorizationArgs,
  MutationDeleteAuthorizationArgs,
  QueryGetEmployeeAuthorizationsArgs,
  QueryGetServiceAuthorizationsArgs,
} from "@/generated/graphql";
import { MyContext } from ".."; // adapte le chemin si besoin

type AuthorizationResponse = {
  message: string;
  success: boolean;
};

export default {
  Query: {
    getServiceAuthorizations: async (
      _: any,
      { serviceId }: QueryGetServiceAuthorizationsArgs,
      ctx: MyContext
    ) => {
      return await new AuthorizationService().getByService(serviceId);
    },

    getEmployeeAuthorizations: async (
      _: any,
      { managerId }: QueryGetEmployeeAuthorizationsArgs,
      ctx: MyContext
    ) => {
      return await new AuthorizationService().getByManager(managerId);
    },
  },

  Mutation: {
    addAuthorization: async (
      _: any,
      { input }: MutationAddAuthorizationArgs,
      ctx: MyContext
    ): Promise<AuthorizationResponse> => {
      const success = await new AuthorizationService().addAuthorization(input);

      if (!success) {
        return {
          message: "Authorization already exists or failed to create.",
          success: false,
        };
      }

      return {
        message: "Authorization successfully created.",
        success: true,
      };
    },

    updateAuthorization: async (
      _: any,
      { input }: MutationUpdateAuthorizationArgs,
      ctx: MyContext
    ): Promise<AuthorizationResponse> => {
      const success = await new AuthorizationService().updateAuthorization(input);

      return {
        message: success
          ? "Authorization updated successfully."
          : "Authorization update failed.",
        success,
      };
    },

    deleteAuthorization: async (
      _: any,
      { serviceId, managerId }: MutationDeleteAuthorizationArgs,
      ctx: MyContext
    ): Promise<AuthorizationResponse> => {
      const success = await new AuthorizationService().deleteAuthorization(serviceId, managerId);

      return {
        message: success
          ? "Authorization deleted successfully."
          : "Authorization not found or already deleted.",
        success,
      };
    },
  },
};
