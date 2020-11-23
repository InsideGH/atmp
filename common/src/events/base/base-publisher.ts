import { Stan } from 'node-nats-streaming';
import { BaseEvent } from './base-event';
import { logger } from '../../logger/pino';

export abstract class Publisher<T extends BaseEvent> {
  /**
   * Publisher must have a subject of type Event.subject generic, provide by the implementing publisher.
   */
  abstract subject: T['subject'];

  /**
   * Create a nats streaming publisher.
   *
   * @param client Nats streaming client
   */
  constructor(protected client: Stan, protected debug: Boolean = false) {
    console.log('#Publisher', debug);
  }

  /**
   * Call this to send the event.
   *
   * @param data Event payload/data.
   */
  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('this.debug', this.debug);
      if (this.debug) {
        console.log(`C ${this.subject} event published`);
        logger.debug(`L ${this.subject} event published`);
      }
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          if (this.debug) {
            logger.debug(`${this.subject} event publishing error ${err}`);
          }
          return reject(err);
        }
        return resolve();
      });
    });
  }
}
