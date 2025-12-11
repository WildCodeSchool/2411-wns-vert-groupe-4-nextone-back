import TicketEntity from "@/entities/Ticket.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import {
  Between,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,

} from "typeorm";
import { Status } from "@/generated/graphql";
import ServicesService from "@/services/services.service";
import ManagerEntity from "@/entities/Manager.entity";

@EventSubscriber()
export class TicketSubscriber
  implements EntitySubscriberInterface<TicketEntity>
{
  listenTo() {
    return TicketEntity;
  }

  async beforeInsert(event: InsertEvent<TicketEntity>): Promise<void> {

    const service = await new ServicesService().db.findOne({
      where: {
        id: event.entity.serviceId
      }
    })
    const { name } = service!
    // const totalTicket = await TicketService.gettInstance().TodayTicket(id);
    const now = new Date();

    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    const totalTicket = await event.manager.getRepository(TicketEntity).count({
      where: {
        service: { id: event.entity.serviceId },
        createdAt: Between(start, end),
      },
    });
    const code = `${name.substring(0, 3).toUpperCase()}-${(totalTicket + 1)
      .toString()
      .padStart(3, "0")}`;

    event.entity.code = code;
  }


  async afterInsert({ entity, manager }: InsertEvent<TicketEntity>) {
    const ticketLog = new TicketLogEntity();
    ticketLog.ticket = entity;
    ticketLog.status = Status.Created;
    await manager.save(ticketLog);
  }

  // async afterUpdate(event: UpdateEvent<TicketEntity>) {
  //   console.log("entityt : ", event.entity)
  //   const isStatusModified = event.updatedColumns.some(
  //     (col) => col.propertyName === "status"
  //   );

  //   if (!isStatusModified) return;

  //   if (!event.entity) return
  //   //ON RECUPERE LE MANAGER
  //   // const manager = await event.manager.getRepository(ManagerEntity).findOneBy({id: event.databaseEntity. })
  // }
}
