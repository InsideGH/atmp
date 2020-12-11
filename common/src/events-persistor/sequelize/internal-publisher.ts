import { internalEventHandler } from '../internal-event-handler';
import { BaseEvent } from '../../events/base/base-event';
import { Transaction } from 'sequelize/types';
import { Event } from './models/event';

/**
 * Does->
 *
 * 1) "persist event in database"
 * 2) "send it to nats"
 *
 * The event to persist and publish is defined at construction time.
 *
 * Means that you create an instance with the event and then use the
 * two methods to create db entry and later on the publishing to the
 * internal event system.
 *
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
