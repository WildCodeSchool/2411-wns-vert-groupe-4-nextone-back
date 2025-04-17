import {
    AfterInsert,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";
  import * as argon2 from "argon2";
  
  @Entity("users")
  export default class UserEntity {
    @BeforeInsert()
    async hashPassword() {
      this.password = await argon2.hash(this.password);
    }
  
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }