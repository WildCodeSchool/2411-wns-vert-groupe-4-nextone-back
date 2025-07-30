import ServicesService from "@/services/services.service";
import {
  MutationCreateServiceArgs,
  MutationUpdateServiceArgs,
  MutationDeleteServiceArgs,
  QueryServiceArgs,
  MutationToggleGlobalAccessServiceArgs,
  ServiceResponse
} from "@/generated/graphql";
import { MyContext } from "..";
import { canAccessAuthorization, checkStrictRole } from "@/utils/manager";
import { buildResponse } from "@/utils/authorization";
import AuthorizationService from "@/services/authorization.service";

const servicesService = new ServicesService();

export default {
  Query: {
    services: async (_: any, __: any, ctx: MyContext) => {
      console.log("ON RENTRE DANS LE RESOLVER")
      const services = await new ServicesService().getAllServices();
      console.log("SERVICES DANS RESOLVER", services);
      return services
    },

    service: async (_: any, { id }: QueryServiceArgs, ctx: MyContext) => {
      return servicesService.getServiceById(id);
    },
  },

  Mutation: {
    createService: async (_: any, { data }: MutationCreateServiceArgs, { manager }: MyContext) => {
      checkStrictRole(manager?.role, "SUPER_ADMIN")
      const newService = await servicesService.createService(data);
      return newService;
    },

    updateService: async (_: any, { id, data }: MutationUpdateServiceArgs, ctx: MyContext): Promise<ServiceResponse> => {
      const updated = await servicesService.updateService(id, data);
      return buildResponse(updated, "Service updated successfully.", "Service not found.")
    },

    deleteService: async (_: any, { id }: MutationDeleteServiceArgs, ctx: MyContext): Promise<ServiceResponse> => {
      const deleted = await servicesService.deleteService(id);
      return buildResponse(deleted, "Service deleted successfully.", "Service not found or already deleted.")
    },

    toggleGlobalAccessService: async (_: any, { id }: MutationToggleGlobalAccessServiceArgs, ctx : MyContext) => {
      const { manager } = ctx;
      if (!manager) {
        throw new Error("Manager non authentifié");
      }
      const service = await servicesService.getServiceById(id);
      if (!service) {
        throw new Error("Service introuvable.");
      }  
      const authorizationService = new AuthorizationService();
      await canAccessAuthorization(manager, service.id, authorizationService)
      const updatedService = await servicesService.toggleGlobalAccess(service);
      return buildResponse(updatedService, "Service is active.", "Service is not active.")
    }
  },
};



