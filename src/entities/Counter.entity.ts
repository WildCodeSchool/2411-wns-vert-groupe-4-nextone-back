import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
    OneToOne,
    JoinColumn,

  } from "typeorm";
import { ServiceEntity } from "./Service.entity";
import ManagerEntity from "./Manager.entity";
    
  @Entity({ name: "counter" })
  export default class CounterEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string

    @Column({ default: true})
    isAvailable: boolean;

    @ManyToMany(() => ServiceEntity)
    @JoinTable()
    services: ServiceEntity[]

    @OneToOne(() => ManagerEntity)
    @JoinColumn()
    manager?: ManagerEntity

    @CreateDateColumn()
    createdAt: Date; 
    
    @UpdateDateColumn()
    updatedAt: Date; 
  }