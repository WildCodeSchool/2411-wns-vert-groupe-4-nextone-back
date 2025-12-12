import TicketEntity from "@/entities/Ticket.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import {
  Between,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import { Status } from "@/generated/graphql";
import ServicesService from "@/services/services.service";

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

}
