import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import * as argon2 from "argon2";
import { ManagerRole } from "@/generated/graphql";
import { IsEmail, Length, IsString } from "class-validator";
import AuthorizationEntity from "./Authorization.entity";
import CompanyEntity from "./Company.entity";
import ConnectionLogEntity from "./ConnectionLog.entity";
import TicketLogEntity from "./TicketLog.entity";

@Entity("manager")
export default class ManagerEntity {
  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @IsString()
  @Length(2, 50, { message: "Le prénom est requis." })
  firstName: string;

  @Column()
  @IsString()
  @Length(2, 50, { message: "Le nom est requis." })
  lastName: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email: string;

  @Column()
  @Length(6, 50, {
    message: "Le mot de passe doit faire au moins 6 caractères.",
  })
  password: string;

  @Column({ nullable: true})
  resetToken?: string

  @Column({ nullable: true })  
  resetTokenExpiration?: Date

  @Column({
    type: "enum",
    enum: ManagerRole,
    nullable: true,
    default: ManagerRole.Operator,
  })
  role: ManagerRole;

  @Column({
    type: "boolean",
    nullable: true,
    default: false,
  })
  isGloballyActive: boolean;

  //AUTHRORIZATION
  @OneToMany(() => AuthorizationEntity, (auth) => auth.manager)
  authorizations: AuthorizationEntity[];

  @Column({ type: "uuid" })
  companyId: string

  //COMPANY
  @ManyToOne(() => CompanyEntity, (company: CompanyEntity) => company.managers, {
    onDelete: "CASCADE",
  })
  company: CompanyEntity;

  //CONNECTIONLOG
  @OneToMany(() => ConnectionLogEntity, (connectionLog) => connectionLog.manager)
  connectionLogs: ConnectionLogEntity[]

  //TICKETLOG
  @OneToMany(() => TicketLogEntity, (ticketLog) => ticketLog.manager, { nullable: true})
  ticketLogs: TicketLogEntity[]
    
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export class LoginInput {
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email: string;

  @Length(6, 50, {
    message: "Le mot de passe doit faire au moins 6 caractères.",
  })
  password: string;
}

export class UpdateInput {
  @Length(2, 50, { message: "Le prénom est requis." })
  first_name: string;

  @Length(2, 50, { message: "Le nom est requis." })
  last_name: string;
}
