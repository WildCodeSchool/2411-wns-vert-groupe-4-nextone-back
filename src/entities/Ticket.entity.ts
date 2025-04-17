import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    Timestamp,
  } from "typeorm";
    
  @Entity({ name: "tickets" })
  export default class TicketEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    code: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @Column({ default: "VALIDATED" })
    status: string; //à remplacer par un enum
  }