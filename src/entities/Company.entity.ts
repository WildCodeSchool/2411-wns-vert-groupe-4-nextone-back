import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,

  } from "typeorm";
import { ServiceEntity } from "./Service.entity";
    
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
    created_at: Date; 
    
    @UpdateDateColumn()
    updated_at: Date; 

    @OneToMany(() => ServiceEntity, (service: ServiceEntity) => service.id)
    services: ServiceEntity[]
  }