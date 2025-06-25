import ManagerEntity from '@/entities/Manager.entity';
import datasource from '../lib/datasource';
import { Repository } from 'typeorm';

export default class ManagerRepository extends Repository<ManagerEntity> {
    constructor() {
        super(ManagerEntity, datasource.createEntityManager());
    }
}