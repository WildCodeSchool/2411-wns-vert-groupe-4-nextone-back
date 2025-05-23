import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Timestamp,
    ManyToOne,
} from "typeorm";

@Entity({ name: "connection_log" })
export default class ConnectionLogEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ default: "VALIDATED" })
    connectionLog: string; //à remplacer par un enum

    @Column()
    managerId: string;

    @CreateDateColumn()
    createdAt: Date;

    // Relations
    // @ManyToOne(() => CompanyEntity, (company) => company.connectionLogs)
    // company: CompanyEntity;
}