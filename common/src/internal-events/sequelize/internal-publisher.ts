import { internalEventHandler } from '../internal-event-handler';
import { BaseEvent } from '../../events/base/base-event';
import { Transaction } from 'sequelize/types';
import { Event } from './models/event';

export class InternalPublisher<T extends BaseEvent> {
  private id?: number;

  constructor(private event: T) {}

  async createDbEntry(transaction: Transaction): Promise<Event> {
    const instance = await Event.create(this.event, { transaction });
    this.id = instance.id;
    return instance;
  }

  publish() {
    if (!this.id) {
      throw new Error('internal-publisher: cannot publish before entry in database has been saved');
    }
    internalEventHandler.publish(this.id);
  }
}
