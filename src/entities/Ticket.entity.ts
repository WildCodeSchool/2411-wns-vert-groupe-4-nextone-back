import { Status } from "@/generated/graphql";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { ServiceEntity } from "./Service.entity";
import TicketLogEntity from "./TicketLog.entity";

@Entity({ name: "ticket" })
export default class TicketEntity {
  
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  code: string;

  @Column({ name: "first_name", nullable: true })
  firstName: string;

  @Column({ name: "last_name", nullable: true})
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

  @ManyToOne(() => ServiceEntity, (service: ServiceEntity) => service.tickets, { eager: true })
  @JoinColumn()
  service: ServiceEntity;

  @OneToMany(() => TicketLogEntity, (ticketLog: TicketLogEntity) => ticketLog.ticket,{ nullable: true})
  ticketLogs: TicketLogEntity[]

  @CreateDateColumn({ name: "created_at"})
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at"})
  updatedAt: Date;

}
