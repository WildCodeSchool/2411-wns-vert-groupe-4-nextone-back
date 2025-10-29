import { ManagerRole } from "@/generated/graphql";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import CompanyEntity from "./Company.entity";
import { createTokenAndExpiration } from "@/utils/tokens.utils";

@Entity({ name: "invitation"})
export default class InvitationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "enum", enum: ManagerRole, default: ManagerRole.Operator })
  role: ManagerRole;

  @Column({ nullable: false, type: "varchar", length: 255 })
  token: string;

  @Column({ nullable: false, type: "timestamp" })
  tokenExpiration: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  companyId: string;

  @ManyToOne(
    () => CompanyEntity,
    (company: CompanyEntity) => company.invitations,
    {
      onDelete: "CASCADE",
    }
  )
  company: CompanyEntity;

  @BeforeInsert()
  createToken() {
    const { token, expiration } = createTokenAndExpiration(24 * 60);
    this.token = token;
    this.tokenExpiration = new Date(expiration);
  }
}
