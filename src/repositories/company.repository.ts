import datasource from '../lib/datasource';
import {  Repository } from 'typeorm';
import CompanyEntity from '@/entities/Company.entity';

export default class CompanyRepository extends Repository<CompanyEntity> {
  constructor() {
    super(CompanyEntity, datasource.createEntityManager());
  }
}