// service.resolver.ts

import ServicesService from "@/services/services.service";
import {
  MutationCreateServiceArgs,
  MutationUpdateServiceArgs,
  MutationDeleteServiceArgs,
  QueryServiceArgs,
  QueryManagersByServiceArgs,
} from "@/generated/graphql";
import { MyContext } from ".."; // adapte si besoin

type ServiceResponse = {
  message: string;
  success: boolean;
};

export default {
  Query: {
    services: async (_: any, __: any, ctx: MyContext) => {
      return await new ServicesService().getAllServices();
    },

    service: async (_: any, { id }: QueryServiceArgs, ctx: MyContext) => {
      return await new ServicesService().getServiceById(id);
    },

    managersByServices: async (_: any, __: any, ctx: MyContext) => {
      return await new ServicesService().getAllServicesWithManagers();
    },

    managersByService: async (_: any, { serviceId }: QueryManagersByServiceArgs, ctx: MyContext) => {
      return await new ServicesService().getManagersByServiceId(serviceId);
    },
  },

  Mutation: {
     createService: async (
      _: any,
      { data }: MutationCreateServiceArgs,
      { manager }: MyContext
    ) => {
    if (!manager || (manager.role !== 'SUPER_ADMIN')) {
      throw new Error("Unauthorized: insufficient permissions");
    }
    const newService = await new ServicesService().createService(data);
    return newService;
  },

    updateService: async (
      _: any,
      { id, data }: MutationUpdateServiceArgs,
      ctx: MyContext
    ): Promise<ServiceResponse> => {
      const updated = await new ServicesService().updateService(id, data);

      return {
        message: updated
          ? "Service updated successfully."
          : "Service not found.",
        success: !!updated,
      };
    },

    deleteService: async (
      _: any,
      { id }: MutationDeleteServiceArgs,
      ctx: MyContext
    ): Promise<ServiceResponse> => {
      const deleted = await new ServicesService().deleteService(id);

      return {
        message: deleted
          ? "Service deleted successfully."
          : "Service not found or already deleted.",
        success: deleted,
      };
    },
  },
};



