import TicketLogsEntity from "@/entities/TicketLog.entity";
import BaseService from "./base.service";


export default class TicketLogService extends BaseService<TicketLogsEntity> {
  private static instance: TicketLogService | null = null;

  private constructor() {
    super(TicketLogsEntity);
  }

  public static getInstance(): TicketLogService {
    if (this.instance === null) {
      this.instance = new TicketLogService();
    }
    return this.instance;
  }

}
