import { Stan } from 'node-nats-streaming';
import { InternalListener } from './internal-listener';
import { internalEventHandler } from '../internal-event-handler';
import { CronNatsPublisher } from './cron-nats-publisher';
import { InternalPublisher } from './internal-publisher';
import { BaseEvent } from '../../events/base/base-event';
import { Event, initEvent } from '../sequelize/models/event';

interface EventPersistorConfig {
  client: Stan;
}

export class EventPersistor {
  private cronNatsPublisher?: CronNatsPublisher;
  private isStarted = false;

  constructor() {}

  start(config: EventPersistorConfig) {
    if (!this.isStarted) {
      this.cronNatsPublisher = new CronNatsPublisher(config.client);
      new InternalListener(config.client).listen(internalEventHandler);
      this.cronNatsPublisher.start();
    }
  }

  stop() {
    if (this.isStarted) {
      if (this.cronNatsPublisher) {
        this.cronNatsPublisher.stop();
      }
      internalEventHandler.closeAll();
    }
  }

  getPublisher<T extends BaseEvent>(event: T) {
    return new InternalPublisher<T>(event);
  }

  getModel() {
    return {
      Event,
      initEvent,
    };
  }
}

export const eventPersistor = new EventPersistor();
