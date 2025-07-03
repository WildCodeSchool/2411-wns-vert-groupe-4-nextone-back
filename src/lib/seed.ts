import CompanyEntity from "@/entities/Company.entity"
import CompanyService from "@/services/company.service"

const createCompany = async (): Promise<boolean> => {
  const company = new CompanyEntity()
  company.name = "Jambonneau CORPORATION"
  company.address = "38, Rue de la saucisse"
  company.postalCode = "31000"
  company.city = "TOULOUSE"
  company.siret = "362 521 879 00034"
  company.email = "jambo.no@gmail.com"
  company.phone = "0123456789"

  const created = await CompanyService.getService().createOne(company)

  return !!created
}