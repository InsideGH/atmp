import { Stan } from 'node-nats-streaming';
import { logger } from '../../logger/pino';
import { AnyEvent } from './any-event';

interface Config {
  enableDebugLogs?: Boolean;
  publisherName?: string;
}

/**
 * o()o()o-> REASON FOR EXISTENSE AND WHY ITS **ALLOWED** IS DESCRIBED IN THE ANYEVENT FILE. <-o()o()o
 *
 * This is a publisher that can be used to send 'AnyEvent's with.
 *
 * NOTE, should NOT BE USED (do not export it from common)
 * by any other part in the system due to it's unsafe publishing capabilities.
 *
 * Using this module, you can publish any combination of subject and data onto
 * nats, making life hard for the listeners.
 *
 */
export class AnyPublisher {
  name: string;

  /**
   * Create a nats streaming publisher.
   *
   * @param client Nats streaming client
   * @param enableDebugLogs Enable debug logs, requires LOG_LEVEL=debug
   * @param publisherName Appends name to logs if exists
   */
  constructor(
    protected client: Stan,
    private config: Config = {
      enableDebugLogs: false,
    },
  ) {
    this.name = `any-publisher-${config.publisherName}`;
  }

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
   */
  publish(event: AnyEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(event.subject, JSON.stringify(event.data), (err) => {
        if (err) {
          if (this.config.enableDebugLogs) {
            logger.debug(
              `${this.name}: publishing error for event id=${event.data.id} subject=${event.subject}`,
            );
          }
          return reject(err);
        }
        if (this.config.enableDebugLogs) {
          logger.debug(
            `${this.name}: sent event id=${event.data.id} subject=${event.subject} to nats`,
          );
        }
        return resolve();
      });
    });
  }
}
