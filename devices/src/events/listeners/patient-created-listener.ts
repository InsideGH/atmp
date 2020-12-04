import { PatientCreatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

export class PatientCreatedListener extends Listener<PatientCreatedEvent> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, {
      enableDebugLogs: true,
    });
  }
  async onMessage(data: { id: number; versionKey: number; name: string }, msg: Message) {
    const transaction = await db.sequelize.transaction();

    try {
      /**
       * Make it handle create event received multiple times (findOrCreate)
       */
      const [patient, created] = await models.Patient.findOrCreate({
        where: {
          id: data.id,
        },
        defaults: {
          id: data.id,
          name: data.name,
          versionKey: data.versionKey,
        },
        transaction,
      });

      if (created) {
        logger.info(`Patient created event handled with id=${data.id}`);
      } else {
        logger.info(`Patient created event ignored, already handled with id=${data.id}`);
      }

      await transaction.commit();
      msg.ack();
    } catch (error) {
      await transaction.rollback();
      logger.error(`Patient created event with id=${data.id} failed with error ${error}`);
      throw error;
    }
  }
}
