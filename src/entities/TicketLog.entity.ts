import { Status } from "@/generated/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @ManyToOne(() => ManagerEntity, (manager: ManagerEntity) => manager.id, {
    eager: true,
    nullable: true,
  })
  manager: ManagerEntity;

  @ManyToOne(() => TicketEntity, (ticket: TicketEntity) => ticket.id, {
    eager: true,
  })
  ticket: TicketEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
