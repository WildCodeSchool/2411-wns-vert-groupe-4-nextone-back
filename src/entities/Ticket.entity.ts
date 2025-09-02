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

@Entity({ name: "ticket" })
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

  // @Column({ type: "uuid", nullable: true})
  // ServiceId: string;

  @ManyToOne(() => ServiceEntity, (service: ServiceEntity) => service.id, { eager: true})
  service: ServiceEntity;

  @CreateDateColumn({ name: "created_at"})
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at"})
  updatedAt: Date;

}
