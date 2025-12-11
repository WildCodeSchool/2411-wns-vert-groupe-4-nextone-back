import ServicesService from "@/services/services.service";
import {
  MutationCreateServiceArgs,
  MutationUpdateServiceArgs,
  MutationDeleteServiceArgs,
  QueryServiceArgs,
  MutationToggleGlobalAccessServiceArgs,
  ServiceResponse,
  Service,
  QueryServicesByKeyArgs,
} from "@/generated/graphql";
import { MyContext, ResolverWrapper } from "..";
import { canAccessAuthorization, checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import AuthorizationService from "@/services/authorization.service";
import { ServiceEntity } from "@/entities/Service.entity";
import TicketService from "@/services/ticket.service";
import CompanyService from "@/services/company.service";
import { composeResolvers } from "@graphql-tools/resolvers-composition";
import { isAuthenticated } from "./ticket.resolver";
import { GraphQLError } from "graphql";
import { pubsub } from "@/lib/pubsub";
import { EVENTS } from "@/subscriptions/events";

const servicesService = new ServicesService();

const serviceResolver = {
  Query: {
    services: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<ServiceEntity[]> => {
      const services = await new ServicesService().getAllServices(
        ctx.manager?.companyId!
      );
      return services;
    },

    service: async (
      _: any,
      { id }: QueryServiceArgs,
      ctx: MyContext
    ): Promise<ServiceEntity | null> => {
      const service = await servicesService.getServiceById(id);
      return service;
    },
    servicesByKey: async (
      _: any,
      args: QueryServicesByKeyArgs,
      ctx: MyContext
    ): Promise<ServiceEntity[]> => {
      return servicesService.findServicesByKey(args.key, ctx.ip!);
    },
  },

  Mutation: {
    createService: async (
      _: any,
      { data }: MutationCreateServiceArgs,
      { manager }: MyContext
    ): Promise<ServiceEntity> => {
      checkStrictRole(manager?.role, "SUPER_ADMIN");
      if (data.companyId !== manager?.companyId) {
        throw new GraphQLError("Forbidden.");
      }
      const newService = await servicesService.createService(data);
      return newService;
    },

    updateService: async (
      _: any,
      { id, data }: MutationUpdateServiceArgs,
      ctx: MyContext
    ): Promise<ServiceResponse> => {
      const updated = await servicesService.updateService(id, data);
      return buildResponse(
        updated,
        "Service updated successfully.",
        "Service not found."
      );
    },

    deleteService: async (
      _: any,
      { id }: MutationDeleteServiceArgs,
      ctx: MyContext
    ): Promise<ServiceResponse> => {
      const deleted = await servicesService.deleteService(id);
      return buildResponse(
        deleted,
        "Service deleted successfully.",
        "Service not found or already deleted."
      );
    },

    toggleGlobalAccessService: async (
      _: any,
      { id }: MutationToggleGlobalAccessServiceArgs,
      ctx: MyContext
    ): Promise<ServiceResponse> => {
      const { manager } = ctx;
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const service = await servicesService.getServiceById(id);
      if (!service) {
        throw new Error("Service introuvable.");
      }
      const authorizationService = new AuthorizationService();
      await canAccessAuthorization(manager, service.id, authorizationService);
      const updatedService = await servicesService.toggleGlobalAccess(service);
      return buildResponse(
        updatedService,
        "Service is active.",
        "Service is not active."
      );
    },
  },

  // ============================================================================
  //  SUBSCRIPTIONS (WebSocket)
  // ============================================================================
  Subscription: {
    serviceToggled: {
      subscribe: () => {
        console.log("✅ Subscription active : serviceToggled");
        return pubsub.asyncIterableIterator(EVENTS.SERVICE_TOGGLED);
      },
    },
  },

  Service: {
    authorizations: async ({ id }: { id: string }) => {
      return await new AuthorizationService().getByService(id);
    },
    // tickets: async ({ id }: { id: string }) => {
    //   return await TicketService.gettInstance().findByProperties({
    //     serviceId: id,
    //   });
    // },

    tickets: async ({ id }: { id: string }) => {
      const result =
        await TicketService.gettInstance().findByPropertiesAndCount({
          serviceId: id,
        });
      return result.items || [];
    },

    company: async ({ id }: { id: string }) => {
      const service = await new ServicesService().getServiceById(id);
      if (!service) {
        throw new Error("No service with this id.");
      }
      const company = await CompanyService.getService().findById(
        service.companyId
      );
      return company;
    },
  },
};

const isServiceFromCompany =
  (): ResolverWrapper<MutationUpdateServiceArgs> =>
  (next) =>
  async (root, args, context, info) => {
    await servicesService.checkService(args.id, context.manager?.companyId!);
    return next(root, args, context, info);
  };

const composition = {
  "*.*": [isAuthenticated()],
  "Query.service": [isServiceFromCompany()],
  "Mutation.{updateService, deleteService, toggleGlobalAccessService}": [
    isServiceFromCompany(),
  ],
};

export default composeResolvers(serviceResolver, composition);
