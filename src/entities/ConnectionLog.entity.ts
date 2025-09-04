import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
} from "typeorm";
import { ConnectionEnum } from "@/generated/graphql";
import ManagerEntity from "./Manager.entity";

@Entity({ name: "connection_log" })
export default class ConnectionLogEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ConnectionEnum,
  })
  type: ConnectionEnum;

  @Column({ type: "uuid" })
  managerId: string;

  @CreateDateColumn()
  createdAt: Date;

  //MANAGER
  @ManyToOne(() => ManagerEntity, (manager) => manager.connectionLogs, {
    onDelete: "CASCADE",
  })
  manager: ManagerEntity
}




