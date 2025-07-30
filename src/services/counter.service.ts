import CounterEntity from "@/entities/Counter.entity";
import BaseService from "./base.service";
import ManagerService from "./manager.service";
import ServicesService from "./services.service";

export default class CounterService extends BaseService<CounterEntity> {
  private static instance: CounterService | null = null;

  private constructor() {
    super(CounterEntity);
  }

  public static getService(): CounterService {
    if (!this.instance) {
      this.instance = new CounterService();
    }
    return this.instance;
  }

  public async addManager(
    id: string,
    managerId: string
  ): Promise<CounterEntity> {
    const counter = await this.findById(id);
    if (!counter) {
      throw new Error("No counter with this id.");
    }
    const manager = await new ManagerService().findOne(managerId);
    if (!manager) {
      throw new Error("No manager with this id.");
    }
    counter.manager = manager;
    this.repo.save(counter);
    return counter;
  }

  public async removeManager(id: string): Promise<CounterEntity> {
    const counter = await this.findById(id);
    if (!counter) {
      throw new Error("No counter with this id.");
    }
    counter.manager = undefined;
    this.repo.save(counter);
    return counter;
  }

  public async updateServices(
    id: string,
    addingIds: string[],
    removingIds: string[]
  ): Promise<CounterEntity> {
    const counter = await this.findById(id);
    if (!counter) {
      throw new Error("No counter with this id.");
    }

    //ON SUPPRIME D'ABORD LES SERVICES DE REMOVING
    const newServs = counter.services.filter((service) => {
      return !removingIds.includes(service.id);
    });

    //ENSUITE ON AJOUTE LES NOUVEAUX
    await Promise.all(
      addingIds.map(async (id) => {
        const currentService = await new ServicesService().getServiceById(id);
        if (!currentService) {
          return;
        }
        return newServs.push(currentService);
      })
    );

    //ON MET A JOUR
    counter.services = newServs;
    this.repo.save(counter);
    return counter;
  }
}
