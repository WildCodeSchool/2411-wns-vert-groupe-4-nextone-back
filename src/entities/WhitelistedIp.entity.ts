import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import AuthorizationEntity from "./Authorization.entity";
import TicketEntity from "./Ticket.entity";
import CompanyEntity from "./Company.entity";

@Entity("whitelisted_ip")
export class WhitelistedIpEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  ipAddress: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  //COMPANY
  @ManyToOne(() => CompanyEntity, (company) => company.whitelistedIps, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  company: CompanyEntity;
}
