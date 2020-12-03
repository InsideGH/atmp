import { Stan } from 'node-nats-streaming';
import { logger } from '../../logger/pino';
import { BaseEvent } from '../base/base-event';

interface Config {
  enableDebugLogs?: Boolean;
}

export class EventPublisher<T extends BaseEvent> {
  /**
   * Create a nats streaming publisher.
   *
   */
  constructor(
    private client: Stan,
    private config: Config = {
      enableDebugLogs: false,
    },
  ) {}

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
   */
  publish(event: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(event.subject, JSON.stringify(event.data), (err) => {
        if (err) {
          if (this.config.enableDebugLogs) {
            logger.debug(`event-publisher: ${event.subject} event publishing error ${err}`);
          }
          return reject(err);
        }
        if (this.config.enableDebugLogs) {
          logger.debug(`event-publisher: ${event.subject} event published`);
        }
        return resolve();
      });
    });
  }
}
