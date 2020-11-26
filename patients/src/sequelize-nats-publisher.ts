import {
  logger,
  natsWrapper,
  ErrorEventPublisher,
  InternalEventHandler,
  AnyPublisher,
} from '@thelarsson/acss-common';

import Event from './sequelize/models/event';

export class SequelizeNatsPublisher {
  publisher = new AnyPublisher(natsWrapper.client, true, 'direct');

  listen(internalEventHandler: InternalEventHandler) {
    /**
     * Listen for internal events to be able to send them of directly to nats.
     *
     */
    internalEventHandler.listen(async (id: string) => {
      try {
        const event = await Event.findByPk(id);

        /**
         * In case the event is not found, we have some strange problems. Send a
         * error event instead.
         */
        if (!event) {
          const errorMessage = `sequelize-nats-publisher: event with id=${id} not found`;
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
          return logger.info(`sequelize-nats-publisher: event with id=${id} already sent`);
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
      } catch (error) {
        logger.error(
          `sequelize-nats-publisher: could not send event error ${error}, silently ignoring and letting cron take its turn.`,
        );
      }
    });
  }
}
