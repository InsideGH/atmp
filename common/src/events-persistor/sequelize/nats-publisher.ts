import { logger } from '../../logger/pino';
import { ErrorEventPublisher } from '../../events/publishers/error-event-publisher';
import { AnyPublisher } from './any-publisher';
import { Event } from './models/event';
import { Stan } from 'node-nats-streaming';

/**
 * Provided the database ID of the event, it will send it to nats and mark db entry as sent.
 */
export class NatsPublisher {
  private publisher: AnyPublisher;

  constructor(private stan: Stan, name?: string) {
    this.publisher = new AnyPublisher(stan, {
      enableDebugLogs: true,
      publisherName: name,
    });
  }

  async sendEvent(id: number) {
    const event = await Event.findByPk(id);

    /**
     * In case the event is not found, we have some strange problems. Send a
     * error event instead.
     */
    if (!event) {
      const errorMessage = `nats-publisher: event with id=${id} not found`;
      logger.error(errorMessage);

      return await new ErrorEventPublisher(this.stan, true).publish({
        serviceName: 'patients',
        errorMessage,
        errorEvent: {
          subject: '',
          data: {},
        },
      });
    }

    /**
     * Already sent for some reason. Probably a cron job managed to get inbetween.
     */
    if (event.sent) {
      return logger.info(`nats-publisher: event with id=${id} already sent`);
    }

    /**
     * Send it to NATS.
     *
     * Taking down the nats server and bringing it up again BEFORE receiveing connection lost,
     * all the publish calls below will fire off.
     *
     * This means that if there are cron jobs starting during that period of time, they will also fire of
     * the event(s). Resulting in duplication of events sent.
     *
     * We do not want to use database transaction with network calls due to possibility to run out of
     * transactions and not being able to serve the API routes.
     */
    await this.publisher.publish({
      subject: event.subject,
      data: event.data,
    });

    /**
     * We are here and alive, time to mark the event as sent.
     */
    event.sent = true;
    await event.save();
  }
}
