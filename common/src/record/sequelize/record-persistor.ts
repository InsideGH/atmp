import { Services } from '../../events/services';
import { Transaction } from 'sequelize/types';
import { Record, initRecord } from './models/record';
import { RecordPublisher } from '../record-publisher';
import { Stan } from 'node-nats-streaming';

export abstract class RecordPersistor {
  protected abstract service: Services;
  private entry?: Record;

  constructor(private client: Stan, private msg: string, private data?: any) {}

  public async createDbEntry(transaction: Transaction) {
    const entry = await Record.create(
      {
        msg: this.msg,
        data: this.data,
      },
      { transaction },
    );
    this.entry = entry;
    return this;
  }

  public async publishId() {
    if (this.entry) {
      const publisher = new RecordPublisher(this.client, {
        enableDebugLogs: false,
      });

      await publisher.publish({
        service: this.service,
        id: this.entry.id,
      });
    } else {
      throw new Error('Not allowed to publish before creating entry in database');
    }
  }

  public static getModel() {
    return {
      Record,
      initRecord,
    };
  }
}
