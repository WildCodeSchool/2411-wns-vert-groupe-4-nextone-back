import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceEntity } from "./Service.entity";
import ManagerEntity from './Manager.entity';
// import { ManagerEntity } from "./Manager.entity"; // commenté car pas encore créé

@Entity('authorizations')
export default class AuthorizationEntity {
  @PrimaryColumn('uuid')
  serviceId: string; // composite key

  @PrimaryColumn('uuid')
  managerId: string; // composite key

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;


  // Relations
 
  // Relation vers Service (ManyToOne)
  // @ManyToOne(() => ServiceEntity, (service) => service.authorizations)
  // @JoinColumn({ name: "serviceId" })
  // service: ServiceEntity;

  
  @ManyToOne(() => ManagerEntity, (manager) => manager.authorizations)
  manager: ManagerEntity;

  @ManyToOne(() => ServiceEntity, (service) => service.authorizations)
  service: ServiceEntity;

  // Relation vers Manager (ManyToOne) quand elle sera créée
  // @ManyToOne(() => ManagerEntity, (manager) => manager.authorizations)
  // @JoinColumn({ name: "managerId" })
  // manager: ManagerEntity;

}