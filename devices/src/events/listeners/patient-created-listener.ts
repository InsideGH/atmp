import { PatientCreatedEvent, Subjects, logger } from '@thelarsson/acss-common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

import {Listener} from './base-listener';

export class PatientCreatedListener extends Listener<PatientCreatedEvent> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: { id: number; versionKey: number; name: string }, msg: Message) {
    const transaction = await db.sequelize.transaction();

    try {
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

      await transaction.commit();

      msg.ack();

      if (created) {
        logger.info(`Patient created event handled with id=${data.id}`);
      } else {
        console.log('ignroed');
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(`Patient created event with id=${data.id} failed with error ${error}`);
      throw error;
    }
  }
}
