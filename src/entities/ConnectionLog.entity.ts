import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Timestamp,
    ManyToOne,
} from "typeorm";
import { ConnectionEnum } from "@/generated/graphql";
// import ManagerEntity from "@/entities/Manager.entity";

@Entity({ name: "connection_log" })
export default class ConnectionLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ConnectionEnum,
  })
  type: ConnectionEnum; 

  @Column()
  managerId: string;

  @CreateDateColumn()
  createdAt: Date;
}

    // Relations
    // @ManyToOne(() => CompanyEntity, (company) => company.connectionLogs)
    // company: CompanyEntity;

    // @ManyToOne(() => ManagerEntity, (manager) => manager.connectionLogs, {
    //onDelete: "CASCADE",
// })
// manager: ManagerEntity;

//}