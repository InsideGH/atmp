import { logger, ErrorEventPublisher, AnyPublisher } from '@thelarsson/acss-common';
import Event from '../../sequelize/models/event';
import { natsWrapper } from '../../nats-wrapper';

export class NatsPublisher {
  private publisher: AnyPublisher;

  constructor(name?: string) {
    this.publisher = new AnyPublisher(natsWrapper.client, {
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

      return await new ErrorEventPublisher(natsWrapper.client, true).publish({
        serviceName: 'patients',
        errorMessage,
        errorEvent: {
          subject: '',
          data: {},
        },
      });
    }

    /**
     * Already sent for some reason. Maybe a cron job managed to get inbetween?
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
