import { logger, InternalEventHandler } from '@thelarsson/acss-common';
import { NatsPublisher } from './nats-publisher';

export class InternalListener {
  private publisher = new NatsPublisher('direct');

  /**
   * Listen for internal events to be able to send them of directly to nats.
   *
   */
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
