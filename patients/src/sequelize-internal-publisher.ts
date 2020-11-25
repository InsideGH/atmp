import { BaseEvent } from '@thelarsson/acss-common';
import { Transaction } from 'sequelize/types';
import { internalEventHandler } from './internal-event-handler';
import Event, { EventInstance } from './sequelize/models/event';

export class SequelizeInternalPublisher<T extends BaseEvent> {
  public id?: string;

  constructor(public event: T) {}

  async createDbEntry(transaction: Transaction): Promise<EventInstance> {
    const instance = await Event.create(this.event, { transaction });
    this.id = instance.id;
    return instance;
  }

  publish() {
    if (!this.id) {
      throw new Error('Cannot publish before entry in database has been saved');
    }
    internalEventHandler.publish(this.id);
  }
}
