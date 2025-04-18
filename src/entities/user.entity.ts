import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export default class UserEntity {

  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    default : "william"
  })
  mail!: string

  @Column()
  password!: string

}