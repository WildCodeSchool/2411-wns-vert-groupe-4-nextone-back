import CounterEntity from "@/entities/Counter.entity";
import {
  MutationAddManagerOnCounterArgs,
  MutationCreateCounterArgs,
  MutationDeleteCounterArgs,
  MutationRemoveManagerOnCounterArgs,
  MutationUpdateCounterArgs,
  MutationUpdateServiceOnCounterArgs,
  QueryCounterArgs,
} from "@/generated/graphql";
import CounterService from "@/services/counter.service";

const counterService = CounterService.getService();

export default {
  Query: {
    async counter(_: any, { counterId }: QueryCounterArgs) {
      return await counterService.findById(counterId);
    },
    async counters() {
      return await counterService.findAll();
    },
  },
  Mutation: {
    async createCounter(_: any, args: MutationCreateCounterArgs) {
      return await counterService.createOne(args.data);
    },
    async updateCounter(_: any, { id, data }: MutationUpdateCounterArgs) {
      return await counterService.updateOne(id, data);
    },
    async deleteCounter(_: any, { id }: MutationDeleteCounterArgs) {
      const deleted = await counterService.deleteOne(id);
      if (deleted) {
        return {
          success: true,
          content: `Counter ${id} deleted.`,
        };
      }
      return {
        success: false,
        content: `failed to delete Counter ${id}`,
      };
    },
    async addManagerOnCounter(
      _: any,
      { data: { id, managerId } }: MutationAddManagerOnCounterArgs
    ): Promise<CounterEntity> {
      return await counterService.addManager(id, managerId);
    },
    async removeManagerOnCounter(
      _: any,
      { id }: MutationRemoveManagerOnCounterArgs
    ): Promise<CounterEntity> {
      return await counterService.removeManager(id);
    },
    async updateServiceOnCounter(
      _: any,
      args: MutationUpdateServiceOnCounterArgs
    ): Promise<CounterEntity> {
      const { serviceIdsToAdd, serviceIdsToRemove } = args.data;
      return await counterService.updateServices(
        args.id,
        serviceIdsToAdd,
        serviceIdsToRemove
      );
    },
  },
};
