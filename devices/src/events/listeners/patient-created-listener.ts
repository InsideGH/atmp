import { PatientCreatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';
import { DeviceRecord } from '../../record/device-record';

export class PatientCreatedListener extends Listener<PatientCreatedEvent> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, {
      enableDebugLogs: false,
    });
  }
  async onMessage(event: { id: number; versionKey: number; name: string }, msg: Message) {
    const transaction = await db.sequelize.transaction();

    try {
      /**
       * Make it handle create event received multiple times (findOrCreate)
       */
      const [patient, created] = await models.Patient.findOrCreate({
        where: {
          id: event.id,
        },
        defaults: {
          id: event.id,
          name: event.name,
          versionKey: event.versionKey,
        },
        transaction,
      });

      if (created) {
        await new DeviceRecord(this.client, 'Patient created', patient).createDbEntry(transaction);
        logger.info(`[EVENT] Patient id=${patient.id}.${patient.versionKey} created`);
      } else {
        logger.info(`[EVENT] Patient id=${patient.id}.${patient.versionKey} create ignored`);
      }

      await transaction.commit();
      msg.ack();
    } catch (error) {
      await transaction.rollback();
      logger.error(error, `Patient created event with id=${event.id}.${event.versionKey} failed`);
      throw error;
    }
  }
}
