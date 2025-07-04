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
  // import CompanyEntity from './Company.entity';

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

    @ManyToMany(() => ManagerEntity, manager => manager.services)
    managers: ManagerEntity[];

  // Un service peut avoir plusieurs tickets - en attente
  // @OneToMany(() => TicketEntity, (ticket) => ticket.service)
  // tickets: TicketEntity[];

  // Un service appartient à une entreprise - en attente
  // @ManyToOne(() => CompanyEntity, (company) => company.services)
  // company: CompanyEntity;
  }