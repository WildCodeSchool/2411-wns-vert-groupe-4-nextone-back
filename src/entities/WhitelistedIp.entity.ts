
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import CompanyEntity from "./Company.entity";


@Entity("whitelisted_ip")
export class WhitelistedIpEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: false, nullable: false , type: "varchar", length: 15})
  ipAddress: string;

  @Column({ type: "uuid" })
  companyId: string;

  @Column({ type: "varchar", length: 21, nullable: false })
  key: string
 
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relations
  //COMPANY
  @ManyToOne(() => CompanyEntity, (company) => company.whitelistedIps, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  company: CompanyEntity;

  @BeforeInsert()
  async createKey() {
    const { nanoid } = await import('nanoid')
    this.key = nanoid()
  }
}
