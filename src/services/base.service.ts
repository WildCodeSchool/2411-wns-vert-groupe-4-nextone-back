import {
  DeepPartial,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm";
import AppDataSource from "../lib/datasource";
import { CreateCompanyInput } from "@/generated/graphql";

export default abstract class BaseService<T extends ObjectLiteral> {
  protected repo: Repository<T>;

  constructor(entity: EntityTarget<T>) {
    this.repo = AppDataSource.getRepository(entity);
  }

  //CREER UNE INSTANCE DE T
  public async createOne(entity: DeepPartial<T>) {
    const created = await this.repo.save(this.repo.create(entity));
    //ON RECHERCHE AVEC UN FIND POUR RECUPERER LES RELATIONS EN MEME TEMPS
    const finded = await this.repo.findOne({ where: { id: created.id } });
    if (!finded) {
      throw new Error("Impossible de créer l'entité");
    }

    return finded;
  }

  //RECUPERER TOUTES LES INSTANCES
  public async findAll() {
    const list = await this.repo.find();
    return list;
  }

  //RECUPERER UNE INSTANCE VIA SON ID
  public async findById(id: string) {
    const ad = await this.repo.findOne({
      where: {
        id,
      } as any,
    });
    return ad;
  }

  //RECUPERER VIA UNE SEULE PROPRIETE
  public async findByProperty<K extends keyof T>(
    fields: K,
    value: T[K]
  ): Promise<T[]> {
    const entities = await this.repo.find({
      where: {
        [fields]: value,
      } as any,
    });

    return entities;
  }

  //RECUPERER VIA PLUSIEURS PROPRIETES
  public async findByProperties(fields: FindOptionsWhere<T>): Promise<T[]> {
    return await this.repo.find({
      where: {
        ...fields,
      },
    });
  }

  //RECUPERER ENTRE 2 DATES DE CREATION
  public async findByCreationSlot(data: {
    start: Date;
    end: Date;
    name: string;
  }): Promise<T[]> {
    const { start, end, name } = data;
    
    const result = await this.repo
      .createQueryBuilder(name)
      .where(`${name}.createdAt >= :start`, { start: new Date(start) })
      .andWhere(`${name}.createdAt <= :end`, { end: new Date(end) }).getMany();

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
  public async updateOne(id: string, entity: Partial<T>):Promise<T | null> {
    const updated = await this.repo.update(id, entity);
    if (!updated) {
      throw new Error("Nothing affected.");
    }
    const updatedEntity = await this.findById(id);

    return updatedEntity;
  }
}
