import UserEntity from '@/entities/Manager.entity';
import datasource from '../lib/datasource';
import { Repository } from 'typeorm';

export default class UserRepository extends Repository<UserEntity> {
    constructor() {
        super(UserEntity, datasource.createEntityManager());
    }
}