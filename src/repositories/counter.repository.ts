import datasource from '../lib/datasource';
import {  Repository } from 'typeorm';
import CounterEntity from '@/entities/Counter.entity';

export default class CounterRepository extends Repository<CounterEntity> {
  constructor() {
    super(CounterEntity, datasource.createEntityManager());
  }
}