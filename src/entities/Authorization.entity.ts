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

@Entity('authorizations')
export default class AuthorizationEntity {
  @PrimaryColumn('uuid')
  serviceId: string;

  @PrimaryColumn('uuid')
  managerId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ManagerEntity, (manager) => manager.authorizations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'managerId' })
  manager: ManagerEntity;

  @ManyToOne(() => ServiceEntity, (service) => service.authorizations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity;
}