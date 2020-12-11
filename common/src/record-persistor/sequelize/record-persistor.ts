import { Services } from '../../events/services';
import { Transaction } from 'sequelize/types';
import { Record, initRecord } from './models/record';
import { RecordPublisher } from '../record-publisher';
import { Stan } from 'node-nats-streaming';

/**
 *
 * To use this you must provide the name of your service according to
 * the options available in Services.
 *
 * The Service is used IF you choose to publish event about you creating
 * a record. In that case, the event will include the ID of the record +
 * the service name.
 *
 * You can do 4 things:
 *
 * 1) Create it
 * 2) Persist a record in database
 * 3) Publish event about it
 * 4) Get models so that you can setup model in your database.
 *
 */
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
