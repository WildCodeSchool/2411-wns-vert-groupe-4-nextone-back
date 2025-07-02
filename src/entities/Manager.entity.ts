import { BeforeInsert, Column, CreateDateColumn,
  Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToMany, JoinTable,} from "typeorm";
import * as argon2 from "argon2";
import { ManagerRole } from "@/generated/graphql";
import { IsEmail, Length, IsString } from "class-validator";
import { ServiceEntity } from "./Service.entity";

@Entity("managers")
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
  first_name: string;

  @Column()
  @IsString()
  @Length(2, 50, { message: "Le nom est requis." })
  last_name: string;

  @Column({ unique: true })
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email: string;

  @Column()
  @Length(6, 50, { message: "Le mot de passe doit faire au moins 6 caractères." })
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

  @ManyToMany(() => ServiceEntity, service => service.managers, { cascade: true })
  @JoinTable()
  services: ServiceEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export class LoginInput {
  @IsEmail({}, { message: "L'adresse email n'est pas valide." })
  email: string;

  @Length(6, 50, { message: "Le mot de passe doit faire au moins 6 caractères." })
  password: string;
}

export class UpdateInput {
  @Length(2, 50, { message: "Le prénom est requis." })
  first_name: string;

  @Length(2, 50, { message: "Le nom est requis." })
  last_name: string;
}
