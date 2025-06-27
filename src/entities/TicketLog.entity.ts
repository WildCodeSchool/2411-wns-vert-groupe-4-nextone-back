import { Status } from "@/generated/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// export enum StatusEnum {
//   created = "CREATED",
//   canceled = "CANCELED",
//   done = "DONE",
//   pending = "PENDING",
//   archived = "ARCHIVED",
// }

@Entity({ name: "ticketlog"})
export default class TicketLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.Created,
  })
  status: Status;

  @Column()
  ticketId: string;

  @Column()
  managerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
