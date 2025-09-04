import AuthorizationService from "@/services/authorization.service";
import CompanyService from "@/services/company.service";
import ConnectionLogService from "@/services/connectionLog.service";
import ManagerService from "@/services/manager.service";
import ServicesService from "@/services/services.service";
import SettingService from "@/services/setting.service";
import TicketService from "@/services/ticket.service";
import TicketLogService from "@/services/ticketLogs.service";
import DataLoader from "dataloader";

//TICKET PAR SERVICE ID
const batchTicketByServiceId = async (serviceIds: Readonly<string[]>) => {
  const tickets = await Promise.all(
    serviceIds.map(async (id) => {
      return await TicketService.gettInstance().findByProperties({
        service: {
          id,
        },
      });
    })
  );
  return tickets;
};

const ticketByServiceIdLoader = new DataLoader(batchTicketByServiceId);

//AUTH PAR SERVICE ID
const batchAuthByServiceId = async (serviceIds: Readonly<string[]>) => {
  const auths = await Promise.all(
    serviceIds.map(async (id) => {
      return await new AuthorizationService().getByService(id);
    })
  );
  return auths;
};

const authsByServiceIdLoader = new DataLoader(batchAuthByServiceId);

//MANAGER
const batchManager = async (managerIds: Readonly<(string | null)[]>) => {
  return await Promise.all(
    managerIds.map(async (id) => {
      if (!id) return;
      return await new ManagerService().getManagerById(id);
    })
  );
};

const managerLoader = new DataLoader(batchManager);

//TICKET
const bachTicket = async (ticketIds: Readonly<string[]>) => {
  return await Promise.all(
    ticketIds.map(async (id) => {
      return await TicketService.gettInstance().findById(id);
    })
  );
};

const ticketLoader = new DataLoader(bachTicket);

//SERVICE
const batchService = async (ticketIds: Readonly<string[]>) => {
  return await Promise.all(
    ticketIds.map(async (id) => {
      return await new ServicesService().db.findOneBy({
        id,
      });
    })
  );
};

const serviceLoader = new DataLoader(batchService);

//TICKETLOGS PAR TICKET ID
const batchTicketLogByTicketId = async (ticketIds: Readonly<string[]>) => {
  return await Promise.all(
    ticketIds.map(async (id) => {
      return await TicketLogService.getInstance().findByProperties({
        ticket: {
          id,
        },
      });
    })
  );
};

const ticketLogByTicketIdLoader = new DataLoader(batchTicketLogByTicketId);

//AUTH PAR MANAGERID
const authByManagerIdLoader = new DataLoader(
  async (managerIds: Readonly<string[]>) => {
    return await Promise.all(
      managerIds.map(async (id) => {
        return await new AuthorizationService().getByManager(id);
      })
    );
  }
);

//CONNECTION LOG PAR MANAGER ID
const connectionLogByManagerIdLoader = new DataLoader(
  async (managerIds: Readonly<string[]>) => {
    return await Promise.all(
      managerIds.map(async (id) => {
        return await new ConnectionLogService().getConnectionLogsByEmployee(id);
      })
    );
  }
);

//TICKETLOGS PAR MANAGERID
const ticketLogsByManagerIdLoader = new DataLoader(
  async (managerIds: Readonly<string[]>) => {
    return await Promise.all(
      managerIds.map(async (id) => {
        return await TicketLogService.getInstance().findByProperties({
          managerId: id,
        });
      })
    );
  }
);

//COMPANY
const companyLoader = new DataLoader(async (companyIds: Readonly<string[]>) => {
  return await Promise.all(
    companyIds.map(async (id) => {
      return await CompanyService.getService().findById(id);
    })
  );
});

//SERVICE BY COMPANYID
const serviceByCompanyIdLoader = new DataLoader(
  async (companyIds: Readonly<string[]>) => {
    return await Promise.all(
      companyIds.map(async (id) => {
        return await new ServicesService().db.findBy({
          company: {
            id,
          },
        });
      })
    );
  }
);

//MANAGER BY COMPANYID
const managerByCompanyIdLoader = new DataLoader(
  async (companyIds: Readonly<string[]>) => {
    return await Promise.all(
      companyIds.map(async (id) => {
        return await new ManagerService().db.findBy({
          company: {
            id,
          },
        });
      })
    );
  }
);

//SETTING PAR COMPANYID
const settingByCompanbyIdLoader = new DataLoader(
  async (companyIds: Readonly<string[]>) => {
    return await Promise.all(
      companyIds.map(async (id) => {
        return await SettingService.getService().findByProperty(
          "companyId",
          id
        );
      })
    );
  }
);

const loaders = {
  ticketLogsByManagerIdLoader,
  connectionLogByManagerIdLoader,
  authByManagerIdLoader,
  ticketLogByTicketIdLoader,
  serviceLoader,
  ticketLoader,
  managerLoader,
  authsByServiceIdLoader,
  ticketByServiceIdLoader,
  companyLoader,
  serviceByCompanyIdLoader,
  managerByCompanyIdLoader,
  settingByCompanbyIdLoader
};

export type Loaders = typeof loaders;
export default loaders;
