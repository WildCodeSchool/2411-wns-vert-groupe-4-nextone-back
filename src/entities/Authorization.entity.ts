import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

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
}

  // Relations
