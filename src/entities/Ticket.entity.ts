import { Status } from "@/generated/graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { ServiceEntity } from "./Service.entity";

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

  @Column({
    type: "enum",
    enum: Status,
    default: Status.Created,
  })
  status: Status;

  @Column({ type: "uuid"})
  ServiceId: string;

  @ManyToOne(() => ServiceEntity, (service: ServiceEntity) => service.id)
  service: ServiceEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
