import {
  logger,
  natsWrapper,
  ErrorEventPublisher,
  InternalEventHandler,
  AnyPublisher,
} from '@thelarsson/acss-common';

import Event from './sequelize/models/event';

export class SequelizeNatsPublisher {
  publisher = new AnyPublisher(natsWrapper.client, true);

  listen(internalEventHandler: InternalEventHandler) {
    internalEventHandler.listen(async (id: string) => {
      const event = await Event.findByPk(id);

      if (!event) {
        const errorMessage = `SequelizeNatsPublisher: event with id=${id} not found`;
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

      if (event.sent) {
        return logger.info(`SequelizeNatsPublisher: event with id=${id} already sent`);
      }

      await this.publisher.publish({
        subject: event.subject,
        data: event.data,
      });

      event.sent = true;

      await event.save();
    });
  }
}
