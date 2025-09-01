import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import AuthorizationEntity from "./Authorization.entity";
import ManagerEntity from "./Manager.entity";
import TicketEntity from "./Ticket.entity";
import CompanyEntity from "./Company.entity";

@Entity("service")
export class ServiceEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "boolean",
    nullable: true,
    default: true,
  })
  isGloballyActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations

  //AUTHORIZATION
  @OneToMany(() => AuthorizationEntity, (auth) => auth.service)
  authorizations: AuthorizationEntity[];

  //TICKETS
  @OneToMany(() => TicketEntity, (ticket) => ticket.id)
  tickets: TicketEntity[];

  //COMPANY
  @Column({ type: "uuid", name: "company_id" })
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.id)
  company: CompanyEntity;
}
