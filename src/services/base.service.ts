import {
  DeepPartial,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  LessThan,
} from "typeorm";
import AppDataSource from "../lib/datasource";
import { ByCreationSlotInput, Order, PaginationInput } from "@/generated/graphql";

export default abstract class BaseService<T extends ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(entity: EntityTarget<T>) {
    this.repo = AppDataSource.getRepository(entity);
  }

  protected getPagination(pagination?: PaginationInput) {
    const cursor = pagination?.cursor ? new Date(pagination.cursor) : undefined; 
    const limit = pagination?.limit || 20;
    const order: Order = pagination?.order || Order.Desc; 
    return { cursor, limit, order };
  }

  //CREER UNE INSTANCE DE T
  public async createOne(entity: DeepPartial<T>) {
    const created = await this.repo.save(this.repo.create(entity));
    const finded = await this.repo.findOne({ where: { id: created.id } });
    if (!finded) {
      throw new Error("Impossible de créer l'entité");
    }
    return finded;
  }

  //RECUPERER TOUTES LES INSTANCES
  public async findAll(pag?: PaginationInput) {
    const { cursor, limit, order } = this.getPagination(pag);
    const where: FindOptionsWhere<T> = {};

    if (cursor) {
       (where as any).createdAt = LessThan(cursor);

    }

    const list = await this.repo.find({
      where: where as any,
      order: { createdAt: order } as any,
      take: limit,
    });

    return list;
  }

  //RECUPERER UNE INSTANCE VIA SON ID
  public async findById(id: string) {
    const ad = await this.repo.findOne({ where: { id } as any });
    return ad;
  }

  //RECUPERER VIA UNE SEULE PROPRIETE
  public async findByProperty<K extends keyof T>(
    fields: K,
    value: T[K],
    pag?: PaginationInput
  ): Promise<{ items: T[]; totalCount: number }> {
    const { cursor, limit, order } = this.getPagination(pag);

    const where: FindOptionsWhere<T> = { [fields]: value } as any;
    if (cursor) {
       (where as any).createdAt = LessThan(cursor);
    }

    const [items, totalCount] = await this.repo.findAndCount({
      where,
      order: { createdAt: order } as any,
      take: limit,
    });

    return { items, totalCount };
  }

  //RECUPERER VIA PLUSIEURS PROPRIETES
  public async findByProperties(
    fields: FindOptionsWhere<T>,
    pag?: PaginationInput
  ): Promise<{ items: T[]; totalCount: number }> {
    const { cursor, limit, order } = this.getPagination(pag);

    const where: FindOptionsWhere<T> = { ...fields };
    if (cursor) {
       (where as any).createdAt = LessThan(cursor); 
    }

    const [items, totalCount] = await this.repo.findAndCount({
      where,
      take: limit,
      order: { createdAt: order } as any,
    });

    return { items, totalCount };
  }

  //RECUPERER ENTRE 2 DATES DE CREATION
  public async findByCreationSlot(data: ByCreationSlotInput): Promise<T[]> {
    const { start, end, name, pagination } = data;
    const startDate = pagination?.cursor || start; 

    const result = await this.repo
      .createQueryBuilder(name)
      .where(`${name}.createdAt >= :start`, { start: new Date(startDate) })
      .andWhere(`${name}.createdAt <= :end`, { end: new Date(end) })
      .orderBy(`${name}.createdAt`, pagination?.order || "ASC")
      .limit(pagination?.limit || 20)
      .getMany();

    return result;
  }

  //DELETE
  public async deleteOne(id: string): Promise<boolean> {
    const deleted = await this.repo.delete({ id: id as any });
    if (!deleted.affected || deleted.affected === 0) {
      return false;
    }
    return true;
  }

  //UPDATE
  public async updateOne(id: string, entity: Partial<T>): Promise<T | null> {
    const updated = await this.repo.update(id, entity);
    if (!updated) {
      throw new Error("Nothing affected.");
    }
    const updatedEntity = await this.findById(id);

    if (!updatedEntity) {
      throw new Error("Entity not found after update");
    }
    return updatedEntity;
  }
}
