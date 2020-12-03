import { Message, Stan } from 'node-nats-streaming';
import { BaseEvent } from './base-event';
import { logger } from '../../logger/pino';

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
  protected ackWait: number = 5 * 1000;

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
  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  /**
   * Call this to create a subscription and get events to the onMessage function.
   */
  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on('message', async (msg: Message) => {
      if (this.config.enableDebugLogs) {
        logger.debug(
          `[${msg.getSequence()}] ${this.subject} event received by ${
            this.queueGroupName
          } : ${msg.getData()}`,
        );
      }

      const parsedData = this.parseMessage(msg);
      try {
        await this.onMessage(parsedData, msg);
      } catch (error) {
        logger.error(`base-listener catched: ${error}`);
      }
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
  }
}
