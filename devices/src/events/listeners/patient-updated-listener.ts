import { PatientUpdatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

export class PatientUpdatedListener extends Listener<PatientUpdatedEvent> {
  subject: Subjects.PatientUpdated = Subjects.PatientUpdated;
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
  async onMessage(
    data: { id: number; versionKey: number; name: string },
    msg: Message,
  ): Promise<void> {
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findOne({
        where: {
          id: data.id,
        },
        transaction,
      });

      if (patient) {
        if (data.versionKey - patient.versionKey == 1) {
          await patient.update(
            {
              versionKey: data.versionKey,
              name: data.name,
            },
            { transaction },
          );
          logger.info(`Patient updated event handled with id=${data.id}`);
        } else {
          throw new Error(
            `Can't updated patient with id=${data.id} versionKey=${data.versionKey}, not found`,
          );
        }
      } else {
        logger.info(`Patient updated event ignore, pating with id=${data.id} not found`);
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
