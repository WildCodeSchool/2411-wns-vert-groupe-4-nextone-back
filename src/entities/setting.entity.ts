import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,

  } from "typeorm";
    
  @Entity({ name: "setting" })
  export default class SettingEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string

    @CreateDateColumn()
    createdAt: Date; 
    
    @UpdateDateColumn()
    updatedAt: Date; 
  }