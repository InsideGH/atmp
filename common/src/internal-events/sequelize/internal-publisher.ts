import { internalEventHandler } from '../internal-event-handler';
import { BaseEvent } from '../../events/base/base-event';
import { Transaction } from 'sequelize/types';
import { Event } from './models/event';

/**
 * Provides somewhat "atomish" like "create event in db" AND "send it to nats via internal event handler" feature.
 *
 * Means that you create an instance and use the two methods to create db entry and later on
 * the publishing to the internal event system.
 *
 * Note, that the db entry at this stage is not sent.
 */
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
