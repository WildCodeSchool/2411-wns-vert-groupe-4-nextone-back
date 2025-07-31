import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
  } from 'typeorm';
  import AuthorizationEntity  from './Authorization.entity';

 @Entity("services")
  export class ServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column()
    name!: string;

    @Column({
      type: "boolean",
      nullable: true,
      default: true, 
    })
    isGloballyActive: boolean;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => AuthorizationEntity, (auth) => auth.service)
    authorizations: AuthorizationEntity[];
  }