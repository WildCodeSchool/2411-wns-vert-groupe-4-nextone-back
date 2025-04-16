import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
  } from "typeorm";
    
  @Entity({ name: "tickets" })
  export default class TicketEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;
  }