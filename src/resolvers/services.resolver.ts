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

const servicesService = new ServicesService();

export default {
  Query: {
    services: async (
      _: any,
      __: any,
      ctx: MyContext
    ): Promise<ServiceEntity[]> => {
      const services = await new ServicesService().getAllServices();
      return services;
    },

    service: async (
      _: any,
      { id }: QueryServiceArgs,
      ctx: MyContext
    ): Promise<ServiceEntity | null> => {
      const service = await servicesService.getServiceById(id);
      console.log("SERVICXE : ", service)
      // if (service ) {
      //   const tickets = await service.tickets
      //   console.log('TICKET : ', tickets)
      //   const res: Service | null = { ...service, tickets: tickets }
      //   return res
        
      // }
      return service
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
};
