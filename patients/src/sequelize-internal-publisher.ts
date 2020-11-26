import { BaseEvent, internalEventHandler } from '@thelarsson/acss-common';
import { Transaction } from 'sequelize/types';
import Event, { EventInstance } from './sequelize/models/event';

export class SequelizeInternalPublisher<T extends BaseEvent> {
  private id?: string;

  constructor(private event: T) {}

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
