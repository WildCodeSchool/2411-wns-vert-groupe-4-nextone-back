// service.repository.ts

import { Repository } from "typeorm";
import { ServiceEntity }  from '../entities/Service.entity';
import datasource from '../lib/datasource';


export default class ServiceRepository extends Repository<ServiceEntity> {
    constructor() {
      super(ServiceEntity, datasource.createEntityManager());
    }
  
    // rajout  méthodes personnalisées
  }