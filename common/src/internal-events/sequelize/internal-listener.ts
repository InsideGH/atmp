import { Stan } from 'node-nats-streaming';
import { logger } from '../../logger/pino';
import { InternalEventHandler } from '../internal-event-handler';
import { NatsPublisher } from './nats-publisher';

/**
 * Listens for internal events that will then be sent to nats using a publisher instance.
 */
export class InternalListener {
  private publisher: NatsPublisher;

  constructor(stan: Stan) {
    this.publisher = new NatsPublisher(stan, 'direct');
  }

  listen(internalEventHandler: InternalEventHandler) {
    internalEventHandler.listen(async (id) => {
      try {
        this.publisher.sendEvent(id);
      } catch (error) {
        logger.error(
          `nats-publisher: could not send event error ${error}, silently ignoring and letting cron take its turn.`,
        );
      }
    });
  }
}
