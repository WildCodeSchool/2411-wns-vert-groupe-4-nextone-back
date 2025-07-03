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

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name"})
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

  @Column({ type: "uuid", name: "service_id"})
  ServiceId: string;

  @ManyToOne(() => ServiceEntity, (service: ServiceEntity) => service.id)
  service: ServiceEntity;

  @CreateDateColumn({ name: "created_at"})
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at"})
  updatedAt: Date;

}
