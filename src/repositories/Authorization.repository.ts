import { Repository } from 'typeorm';
import AuthorizationEntity from  '../entities/Authorization.entity';
import datasource from '../lib/datasource';

export default class AuthorizationRepository extends Repository<AuthorizationEntity> {
  constructor() {
    super(AuthorizationEntity, datasource.createEntityManager());
  }
}

