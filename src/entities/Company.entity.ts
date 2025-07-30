import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,

  } from "typeorm";
import { ServiceEntity } from "./Service.entity";
import ManagerEntity from "./Manager.entity";
    
  @Entity({ name: "company" })
  export default class CompanyEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string

    @Column()
    address: string;

    @Column()
    postalCode: string;

    @Column()
    city: string;

    @Column({
      unique: true
    })
    siret: string;

    @Column({ unique: true })
    email: string

    @Column({
      unique: true
    })
    phone: string

    @CreateDateColumn()
    createdAt: Date; 
    
    @UpdateDateColumn()
    updatedAt: Date; 

    @OneToMany(() => ServiceEntity, (service: ServiceEntity) => service.id)
    services: ServiceEntity[]

    @OneToMany(() => ManagerEntity, (manager: ManagerEntity) => manager.id, { onDelete: "CASCADE" })
    managers: ManagerEntity[]
  }