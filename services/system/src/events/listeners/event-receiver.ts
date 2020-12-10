import { Message, Stan } from 'node-nats-streaming';
import {
  logger,
  Subjects,
  getNatsSubscriptionOptions,
  natsConstants,
  parseNatsMessage,
} from '@thelarsson/acss-common';
import { createEvent } from './create-event';
import { SocketEventChannel } from '../../socket/socket-event-channel';
import { SocketWrapper } from '../../socket/socket-wrapper';
import { queueGroupName } from './queue-group-name';

interface Config {
  enableDebugLogs?: Boolean;
}

const subjects = Object.values(Subjects);

export class EventReceiver {
  /**
   * Create a nats streaming listener.
   */
  constructor(
    protected client: Stan,
    private socketWrapper: SocketWrapper,
    private config: Config = {
      enableDebugLogs: false,
    },
  ) {}

  /**
   * Call this to create a subscription and get events to the onMessage function.
   */
  listen() {
    subjects.forEach((subject) => this.subscribeToEvent(subject));
  }

  /**
   * Subscribe to event subject.
   */
  private subscribeToEvent(subject: Subjects) {
    const subscriptionOptions = getNatsSubscriptionOptions(this.client, {
      ackWait: natsConstants.ackWait,
      queueGroupName,
    });

    const subscription = this.client.subscribe(subject, queueGroupName, subscriptionOptions);

    subscription.on('message', async (msg: Message) => {
      if (this.config.enableDebugLogs) {
        logger.debug(
          `[${msg.getSequence()}] ${subject} event received by ${queueGroupName} : ${msg.getData()}`,
        );
      }

      const data = parseNatsMessage(msg);
      try {
        const event = await createEvent(data, msg);
        msg.ack();
        this.socketWrapper.broadcast(SocketEventChannel.SubjectEvent, event);
      } catch (error) {
        logger.error(`base-listener catched: ${error}`);
      }
    });
  }
}
