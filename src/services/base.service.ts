import { DeepPartial, EntityTarget, ObjectLiteral, Repository } from "typeorm";
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
    return created;
  }

  //RECUPERER TOUTES LES INSTANCE
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

  //DELETE
  public async deleteOne(id: string): Promise<boolean> {
    const deleted = await this.repo.delete({ id: id as any });

    if (!deleted.affected || deleted.affected === 0) {
      return false;
    }
    return true;
  }

  //UPDATE
  public async updateOne(id: string, entity: Partial<T>) {
    const updated = await this.repo.update(id, entity);
    if (!updated) {
      throw new Error("Nothing affected.");
    }
    const updatedEntity = await this.findById(id);
    return updatedEntity;
  }
}
