import TicketEntity from "@/entities/Ticket.entity";
import TicketLogEntity from "@/entities/TicketLog.entity";
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { MyContext } from "..";

@EventSubscriber()
export class TicketSubscriber implements EntitySubscriberInterface<TicketEntity> {

  listenTo() {
    return TicketEntity
  }

  async afterInsert({ entity, manager }: InsertEvent<TicketEntity>) {
    const ticketLog = new TicketLogEntity()
    ticketLog.ticket = entity
    ticketLog.status = entity.status
    await manager.save(ticketLog)
  }

  async afterUpdate(event: UpdateEvent<TicketEntity>) {
    const isStatusModified = event.updatedColumns.some(col => col.propertyName === "status")

    if (!isStatusModified) return;
    

  }

}