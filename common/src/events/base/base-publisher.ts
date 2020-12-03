import { Stan } from 'node-nats-streaming';
import { BaseEvent } from './base-event';
import { logger } from '../../logger/pino';

interface Config {
  enableDebugLogs?: Boolean;
}

export abstract class Publisher<T extends BaseEvent> {
  /**
   * Publisher must have a subject of type Event.subject generic, provide by the implementing publisher.
   */
  abstract subject: T['subject'];

  /**
   * Create a nats streaming publisher.
   */
  constructor(
    protected client: Stan,
    private config: Config = {
      enableDebugLogs: false,
    },
  ) {}

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
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
