import ConnectionLogService from "@/services/connectionLog.service";
import TicketLogService from "@/services/ticketLogs.service";
import DataLoader from "dataloader";

//TICKETLOGS PAR TICKET ID
const batchTicketLogByTicketId = async (ticketIds: Readonly<string[]>) => {
  console.log("TICKETIDS DANS DATALOADER : ", ticketIds);
  return await Promise.all(
    ticketIds.map(async (id) => {
      const res = await TicketLogService.getInstance().findByProperties({
        ticket: {
          id,
        },
      });
      return res.items;
    })
  );
};

const ticketLogByTicketIdLoader = new DataLoader(batchTicketLogByTicketId, {
  cache: false,
});

//CONNECTION LOG PAR MANAGER ID
const connectionLogByManagerIdLoader = new DataLoader(
  async (managerIds: Readonly<string[]>) => {
    return await Promise.all(
      managerIds.map(async (id) => {
        return await new ConnectionLogService().getConnectionLogsByEmployee(id);
      })
    );
  },
  { cache: false }
);

//TICKETLOGS PAR MANAGERID
const ticketLogsByManagerIdLoader = new DataLoader(
  async (managerIds: Readonly<string[]>) => {
    return await Promise.all(
      managerIds.map(async (id) => {
        const res = await TicketLogService.getInstance().findByProperties({
          managerId: id,
        });
        return res.items;
      })
    );
  },
  { cache: false }
);

const loaders = {
  ticketLogsByManagerIdLoader,
  connectionLogByManagerIdLoader,
  ticketLogByTicketIdLoader,
};

export type Loaders = typeof loaders;
export default loaders;
