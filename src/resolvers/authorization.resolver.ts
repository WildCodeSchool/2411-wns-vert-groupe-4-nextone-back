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
import appDataSource from "../lib/datasource";
import { ServiceEntity } from "@/entities/Service.entity";
import ManagerEntity from "@/entities/Manager.entity";
import { GraphQLError } from "graphql";

const authorizationService = new AuthorizationService();

const authorizationResovler = {
  Query: {
    getServiceAuthorizations: async (
      _: any,
      { serviceId }: QueryGetServiceAuthorizationsArgs,
      ctx: MyContext
    ) => {
      const service = await appDataSource.getRepository(ServiceEntity).findOne({
        where: {
          id: serviceId,
        }
      })
      if (!service || service?.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.")
      }
      return await authorizationService.getByService(serviceId);
    },

    getEmployeeAuthorizations: async (
      _: any,
      { managerId }: QueryGetEmployeeAuthorizationsArgs,
      ctx: MyContext
    ) => {
      const manager = await appDataSource.getRepository(ManagerEntity).findOne({
        where: {
          id: managerId
        }
      })
      if (!manager || manager.companyId !== ctx.manager?.companyId) {
        throw new GraphQLError("Forbidden.")
      }
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
    const service = await appDataSource.getRepository(ServiceEntity).findOne({
      where: {
        companyId: context.manager?.companyId,
        id: args.input.serviceId 
      },
    });
    const manager = await appDataSource.getRepository(ManagerEntity).findOne({
      where: {
        companyId: context.manager?.companyId,
        id: args.input.serviceId
      },
    });
    if (!manager || !service) {
      throw new GraphQLError("Forbidden.");
    }
    return next(root, args, context, info);
  };

const composition = {
  "Query.*": [isAuthenticated()],
  "Mutation.*": [isAuthenticated(), isFromCompany()],
};

export default composeResolvers(authorizationResovler, composition);
