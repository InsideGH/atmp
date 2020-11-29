import { InternalListener } from './internal-listener';
import { internalEventHandler } from '../internal-event-handler';
import { CronNatsPublisher } from './cron-nats-publisher';
import { InternalPublisher } from './internal-publisher';
import { BaseEvent } from '../../events/base/base-event';
import { Event, initEvent } from './models/event';
import { EventPersistorConfig } from './event-persistor-config';

/**
 * Main class that different microservice can use to send events to nats,
 * even if nats would be down.
 */
export class EventPersistor {
  private cronNatsPublisher?: CronNatsPublisher;
  private isStarted = false;

  constructor() {}

  start(config: EventPersistorConfig) {
    if (!this.isStarted) {
      this.cronNatsPublisher = new CronNatsPublisher(config);
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

  /**
   * Provided the event, returns a publisher that can do two things.
   *
   * 1) Store event in database
   * 2) Send event to nats (if available). Otherwise the cron job will send it later.
   *
   */
  getPublisher<T extends BaseEvent>(event: T) {
    return new InternalPublisher<T>(event);
  }

  /**
   * Returns the sequelize model and a function that must be called to initialize the model.
   */
  getModel() {
    return {
      Event,
      initEvent,
    };
  }
}

export const eventPersistor = new EventPersistor();
