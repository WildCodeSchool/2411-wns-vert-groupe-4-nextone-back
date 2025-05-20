import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import * as argon2 from "argon2";
import { ManagerRole } from "@/generated/graphql";

@Entity("managers")
export default class ManagerEntity {
  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

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
  is_globally_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
