import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { ServiceEntity } from "./Service.entity";
import ManagerEntity from "./Manager.entity";

@Entity("authorizations")
export default class AuthorizationEntity {
  @PrimaryColumn("uuid")
  serviceId: string;

  @PrimaryColumn("uuid")
  managerId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //MANAGER
  @ManyToOne(() => ManagerEntity, (manager) => manager.authorizations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "managerId" })
  manager: ManagerEntity;

  //SERVICE
  @ManyToOne(() => ServiceEntity, (service) => service.authorizations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "serviceId" })
  service: ServiceEntity;
}
