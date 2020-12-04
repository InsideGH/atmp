import { PatientDeletedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

export class PatientDeletedListener extends Listener<PatientDeletedEvent> {
  subject: Subjects.PatientDeleted = Subjects.PatientDeleted;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, {
      enableDebugLogs: true,
    });
  }

  /**
   * We only want to throw back the event if everything is OK except the versionKey.
   *
   */
  async onMessage(data: { id: number; versionKey: number }, msg: Message): Promise<void> {
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findOne({
        where: {
          id: data.id,
        },
        transaction,
      });

      if (patient) {
        if (data.versionKey - patient.versionKey == 0) {
          await patient.destroy({ transaction });
          logger.info(`Patient deleted event handled with id=${data.id}`);
        } else {
          throw new Error(
            `Can't delete patient with id=${data.id}, versionKey=${data.versionKey} wrong`,
          );
        }
      } else {
        logger.info(`Patient delete event ignore, patient with id=${data.id} not found`);
      }

      await transaction.commit();
      msg.ack();
    } catch (error) {
      await transaction.rollback();
      logger.error(`Patient updated event with id=${data.id} failed with error ${error}`);
      throw error;
    }
  }
}
