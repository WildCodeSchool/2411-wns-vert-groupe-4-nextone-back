import TicketEntity from '@/entities/Ticket.entity';
import datasource from '../lib/datasource';
import { Repository } from 'typeorm';

export default class TicketRepository extends Repository<TicketEntity> {
  constructor() {
    super(TicketEntity, datasource.createEntityManager());
  }

    async findAll(): Promise<TicketEntity[]> {
        return await this.find({
            
        });
    }
}