import { logger, natsWrapper, Subjects, ErrorEventPublisher, InternalEventHandler } from '@thelarsson/acss-common';
import Event, { EventInstance } from './sequelize/models/event';
import { PatientCreatedPublisher } from './events/publishers/patient-created-publisher';
import { PatientUpdatedPublisher } from './events/publishers/patient-updated-publisher';

export class SequelizeNatsPublisher {
  async publishEvent(event: EventInstance) {
    const foundSubject = Object.values(Subjects).find((key) => key == event.subject);

    if (foundSubject) {
      switch (foundSubject) {
        case Subjects.PatientCreated: {
          return await new PatientCreatedPublisher(natsWrapper.client, true).publish(event.data);
        }
        case Subjects.PatientUpdated:
          return await new PatientUpdatedPublisher(natsWrapper.client, true).publish(event.data);
        default:
          break;
      }
    }

    const errorMessage = `SequelizeNatsPublisher: subject ${event.subject} does not match any specified Subjects. Will not publish unknown event.`;
    logger.error(errorMessage);

    await new ErrorEventPublisher(natsWrapper.client, true).publish({
      serviceName: 'patients',
      errorMessage,
      errorEvent: {
        subject: event.subject,
        data: event.data,
      },
    });
  }

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

      await this.publishEvent(event);

      event.sent = true;

      await event.save();
    });
  }
}
