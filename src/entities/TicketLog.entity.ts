import { Status } from "@/generated/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import ManagerEntity from "./Manager.entity";
import TicketEntity from "./Ticket.entity";

@Entity({ name: "ticketlog" })
export default class TicketLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.Created,
  })
  status: Status;


  //MANAGER RELATION

  @Column({ nullable: true, type: "uuid" })
  managerId: string;

  @ManyToOne(() => ManagerEntity, (manager: ManagerEntity) => manager.ticketLogs, {
    nullable: true,
  })
  @JoinColumn()
  manager: ManagerEntity;


  //TICKET RELATION

  @Column({ type: "uuid"})
  ticketId: string;

  @ManyToOne(() => TicketEntity, (ticket: TicketEntity) => ticket.ticketLogs, {
    nullable: true
  })
  @JoinColumn()
  ticket: TicketEntity;



  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
