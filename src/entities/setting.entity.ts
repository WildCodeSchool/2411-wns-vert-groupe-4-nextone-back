import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,

  } from "typeorm";
import CompanyEntity from "./Company.entity";
    
  @Entity({ name: "setting" })
  export default class SettingEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string

    @Column()
    value: string;

    @Column({ type: "uuid"})
    companyId: string;

    @ManyToOne(() => CompanyEntity, (company: CompanyEntity) => company.settings)
    company: CompanyEntity

    @CreateDateColumn()
    createdAt: Date; 
    
    @UpdateDateColumn()
    updatedAt: Date; 
  }