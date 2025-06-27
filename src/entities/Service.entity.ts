// Service.entity.ts

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany, OneToMany
  } from 'typeorm';
  import AuthorizationEntity  from './Authorization.entity';
  import ManagerEntity from './Manager.entity';
  // import TicketEntity from './Ticket.entity';
  // import CompanyEntity from './Company.entity'; // commenté car pas encore créé

 @Entity("services")
  export class ServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column()
    name!: string;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  
  // Relations

    // Un service peut avoir plusieurs autorisations
  @OneToMany(() => AuthorizationEntity, (auth) => auth.service)
  authorizations: AuthorizationEntity[];

  @ManyToMany(() => ManagerEntity, manager => manager.services)
  managers: ManagerEntity[];

  // Un service peut avoir plusieurs tickets - en attente
  // @OneToMany(() => TicketEntity, (ticket) => ticket.service)
  // tickets: TicketEntity[];

  // Un service appartient à une entreprise - en attente
  // @ManyToOne(() => CompanyEntity, (company) => company.services)
  // company: CompanyEntity;
  }