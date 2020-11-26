import { Stan } from 'node-nats-streaming';
import { logger } from '../../logger/pino';
import { AnyEvent } from './any-event';

export class AnyPublisher {
  /**
   * Create a nats streaming publisher.
   *
   * @param client Nats streaming client
   * @param enableDebugLogs Enable debug logs, requires LOG_LEVEL=debug
   */
  constructor(protected client: Stan, protected enableDebugLogs: Boolean = false) {}

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
   */
  publish(event: AnyEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(event.subject, JSON.stringify(event.data), (err) => {
        if (err) {
          if (this.enableDebugLogs) {
            logger.debug(`any-publisher: publishing error for event id=${event.data.id} subject=${event.subject}`);
          }
          return reject(err);
        }
        if (this.enableDebugLogs) {
          logger.debug(`any-publisher: sent event id=${event.data.id} subject=${event.subject} to nats`);
        }
        return resolve();
      });
    });
  }
}
