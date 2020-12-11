import { Stan } from 'node-nats-streaming';
import { BaseEvent } from './base-event';
import { logger } from '../../logger/pino';

/**
 *
 * Implement this will give you a Nats event publisher. All events
 * published must conform to the generic <T extends BaseEvent> structure.
 *
 */
export abstract class Publisher<T extends BaseEvent> {
  /**
   * Publisher must have a subject of type Event.subject generic, provide by the implementing class.
   */
  abstract subject: T['subject'];

  constructor(
    protected client: Stan,
    private config = {
      enableDebugLogs: false,
    },
  ) {}

  /**
   * Call this to send the event.
   */
  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          if (this.config.enableDebugLogs) {
            logger.debug(`base-publisher: ${this.subject} event publishing error ${err}`);
          }
          return reject(err);
        }
        if (this.config.enableDebugLogs) {
          logger.debug(`base-publisher: ${this.subject} event published`);
        }
        return resolve();
      });
    });
  }
}
