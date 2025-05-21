// service.resolver.ts

import ServicesService from "../services/services.service";
import {
  MutationCreateServiceArgs,
  MutationUpdateServiceArgs,
  QueryServiceArgs,
  MutationDeleteServiceArgs,
} from "../generated/graphql";

export default {
  Query: {
    services: async () => {
      return await new ServicesService().getAllServices();
    },
    service: async (_: any, { id }: QueryServiceArgs) => {
      return await new ServicesService().getServiceById(id);
    },
  },
  Mutation: {
    createService: async (_: any, { data }: MutationCreateServiceArgs) => {
      return await new ServicesService().createService(data);
    },
    updateService: async (_: any, { id, data }: MutationUpdateServiceArgs) => {
      return await new ServicesService().updateService(id, data);
    },
    deleteService: async (_: any, { id }: MutationDeleteServiceArgs) => {
      return await new ServicesService().deleteService(id);
    },
  },
};


