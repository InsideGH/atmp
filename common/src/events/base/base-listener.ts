import { Message, Stan } from 'node-nats-streaming';
import { BaseEvent } from './base-event';
import { logger } from '../../logger/pino';
import { getNatsSubscriptionOptions, parseNatsMessage, natsConstants } from '../../nats/config';

interface Config {
  enableDebugLogs?: Boolean;
}

export abstract class Listener<T extends BaseEvent> {
  /**
   * Listener must have a subject of type Event.subject generic, provide by the implementing listener.
   */
  abstract subject: T['subject'];

  /**
   * Listener must have a group name of type string, provide by the implementing listener.
   */
  abstract queueGroupName: string;

  /**
   * Listener must have a onMessage function, provide by the implementing listener.
   */
  abstract onMessage(data: T['data'], msg: Message): Promise<void>;

  /**
   * After 5 seconds without any ack, the event goes back to the nats streaming.
   */
  protected ackWait: number = natsConstants.ackWait;

  /**
   * Create a nats streaming listener.
   */
  constructor(
    protected client: Stan,
    private config: Config = {
      enableDebugLogs: false,
    },
  ) {}

  /**
   * This combination will replay all events to a queueGroup that has not been received and ack:ed by any worker in the queue group.
   * The ack mode is manual.
   */

  /**
   * Call this to create a subscription and get events to the onMessage function.
   */
  listen() {
    const subscriptionOptions = getNatsSubscriptionOptions(this.client, {
      ackWait: this.ackWait,
      queueGroupName: this.queueGroupName,
    });

    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      subscriptionOptions,
    );

    subscription.on('message', async (msg: Message) => {
      if (this.config.enableDebugLogs) {
        logger.debug(
          `[${msg.getSequence()}] ${this.subject} event received by ${
            this.queueGroupName
          } : ${msg.getData()}`,
        );
      }

      const parsedData = parseNatsMessage(msg);
      try {
        await this.onMessage(parsedData, msg);
      } catch (error) {
        logger.error(`base-listener catched: ${error}`);
      }
    });
  }
}
