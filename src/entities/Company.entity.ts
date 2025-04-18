import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,

  } from "typeorm";
    
  @Entity({ name: "company" })
  export default class CompanyEntity {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string

    @Column()
    address: string;

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
  }