import { logger, Services } from '@thelarsson/acss-common';
import { Transaction } from 'sequelize/types';
import { Log, initLog } from './models/log';
import { DbLogPublisher } from '../db-log-publisher';
import { natsWrapper } from '../../nats-wrapper';

export abstract class DbLog {
  protected abstract service: Services;
  private entry?: Log;

  constructor(private msg: string, private data?: any) {}

  public async createDbEntry(transaction: Transaction) {
    const entry = await Log.create(
      {
        msg: this.msg,
        data: this.data,
      },
      { transaction },
    );
    this.entry = entry;
    return this;
  }

  public publish() {
    if (this.entry) {
      const publisher = new DbLogPublisher(natsWrapper.client, {
        enableDebugLogs: true,
      });

      publisher.publish({
        service: this.service,
        id: this.entry.id,
      });
    } else {
      throw new Error('Not allowed to publish before creating entry in database');
    }
  }

  public static getModel() {
    return {
      Log,
      initLog,
    };
  }
}
