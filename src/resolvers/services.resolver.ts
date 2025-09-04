import ServicesService from "@/services/services.service";
import {
  MutationCreateServiceArgs,
  MutationUpdateServiceArgs,
  MutationDeleteServiceArgs,
  QueryServiceArgs,
  MutationToggleGlobalAccessServiceArgs,
  ServiceResponse,
  Service,
} from "@/generated/graphql";
import { MyContext } from "..";
import { canAccessAuthorization, checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import AuthorizationService from "@/services/authorization.service";
import { ServiceEntity } from "@/entities/Service.entity";
import TicketService from "@/services/ticket.service";
import CompanyService from "@/services/company.service";

const servicesService = new ServicesService();

export default {
  Query: {
    services: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<ServiceEntity[]> => {
      console.log("RESOLVER 1");
      const services = await new ServicesService().getAllServices();
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
  },

  Mutation: {
    createService: async (
      _: any,
      { data }: MutationCreateServiceArgs,
      { manager }: MyContext
    ): Promise<ServiceEntity> => {
      checkStrictRole(manager?.role, "SUPER_ADMIN");
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
  Service: {
    authorizations: async (
      { id }: { id: string },
      _: any,
      { loaders: { authsByServiceIdLoader } }: MyContext
    ) => {
      return await authsByServiceIdLoader.load(id);
    },
    tickets: async (
      { id }: { id: string },
      _: any,
      { loaders: { ticketByServiceIdLoader } }: MyContext
    ) => {
      return await ticketByServiceIdLoader.load(id);
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
