import { InternalListener } from './internal-listener';
import { internalEventHandler } from '../internal-event-handler';
import { CronNatsPublisher } from './cron-nats-publisher';
import { InternalPublisher } from './internal-publisher';
import { BaseEvent } from '../../events/base/base-event';
import { Event, initEvent } from './models/event';
import { Stan } from 'node-nats-streaming';

export interface EventPersistorConfig {
  client: Stan;
  cron: {
    cronString: string;
  };
}

/**
 * The main entry point class that various microservice can use to send events to nats,
 * even if nats would be down.
 *
 * You can do 5 things:
 *
 * 1) Create it
 * 2) Start it
 * 3) Stop it
 * 4) Get a publisher to do the two things (persist and publish event)
 * 5) Get sequelize database model to setup database in your microservice.
 *
 */
export class EventPersistor {
  private cronNatsPublisher?: CronNatsPublisher;
  private isStarted = false;

  /**
   * Starts
   *
   * 1) cron publisher
   * 2) 'InternalListener' that will receive events from 'InternalPublisher's through the 'internalEventHandler' nodejs EventEmitter.
   *
   */
  start(config: EventPersistorConfig) {
    if (!this.isStarted) {
      this.cronNatsPublisher = new CronNatsPublisher(config);
      this.cronNatsPublisher.start();
      new InternalListener(config.client).listen(internalEventHandler);
    }
  }

  /**
   * Stops what has been started
   */
  stop() {
    if (this.isStarted) {
      if (this.cronNatsPublisher) {
        this.cronNatsPublisher.stop();
      }
      internalEventHandler.closeAll();
    }
  }

  /**
   * Provided the event (T extends BaseEvent), returns an internal publisher that can do two things.
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

/**
 * We only want this to be created one time since we have cron and event emitter stuff going on here.
 */
export const eventPersistor = new EventPersistor();
