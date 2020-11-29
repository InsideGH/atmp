import { Stan } from 'node-nats-streaming';
import { logger } from '../../logger/pino';
import { BaseEvent } from '../base/base-event';

export class EventPublisher<T extends BaseEvent> {
  /**
   * Create a nats streaming publisher.
   *
   * @param client Nats streaming client
   * @param enableDebugLogs Enable debug logs, requires LOG_LEVEL=debug
   */
  constructor(private client: Stan, protected enableDebugLogs: Boolean = false) {}

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
   */
  publish(event: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(event.subject, JSON.stringify(event.data), (err) => {
        if (err) {
          if (this.enableDebugLogs) {
            logger.debug(`event-publisher: ${event.subject} event publishing error ${err}`);
          }
          return reject(err);
        }
        if (this.enableDebugLogs) {
          logger.debug(`event-publisher: ${event.subject} event published`);
        }
        return resolve();
      });
    });
  }
}