import { eventLogger } from '../../logger/pino';
import { AnyPublisher } from './any-publisher';
import { Event } from './models/event';
import { Stan } from 'node-nats-streaming';

/**
 * Provided the database ID of the event, it will send it to nats and mark db entry as sent.
 */
export class NatsPublisher {
  private publisher: AnyPublisher;

  constructor(private stan: Stan, private name: string) {
    this.publisher = new AnyPublisher(stan, {
      enableDebugLogs: false,
      publisherName: name,
    });
  }

  async sendEvent(id: number) {
    const event = await Event.findByPk(id);

    /**
     * In case the event is not found, we have some VERY strange problems.
     */
    if (!event) {
      const errorMessage = `[${this.name}] Event ${id} send FAIL - not found`;
      eventLogger.error(errorMessage);
      throw new Error(errorMessage);
    }

    /**
     * Already sent for some reason. Probably a cron job managed to get inbetween.
     */
    if (event.sent) {
      return eventLogger.info(
        `[${this.name}] Event data.${event.data.id}.${event.data.versionKey} send IGNORED - already sent`,
      );
    }

    /**
     * Send it to NATS.
     *
     * Taking down the nats server and bringing it up again BEFORE receiveing connection lost,
     * will work since all the publish calls below will fire off when connection has been regained.
     *
     * This means that if there are cron jobs starting during that period of time, they will also fire of
     * the event(s). Resulting in duplication of events sent.
     *
     * We do not want to use database transaction with network calls due to possibility to run out of
     * transactions and not being able to serve our the API routes.
     */
    await this.publisher.publish({
      subject: event.subject,
      data: event.data,
    });

    /**
     * We are here and still ALIVE, this means that NATS has the event, time to mark the event as sent.
     */
    event.sent = true;
    await event.save();

    eventLogger.info(`[${this.name}] Event data.${event.data.id}.${event.data.versionKey} send OK`);
  }
}
