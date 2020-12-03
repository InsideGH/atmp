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

  async onMessage(
    data: { id: number; versionKey: number; name: string },
    msg: Message,
  ): Promise<void> {
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findOne({
        where: {
          id: data.id,
          versionKey: data.versionKey - 1,
        },
        transaction,
      });

      if (!patient) {
        throw new Error(
          `Can't updated patient with id=${data.id} versionKey=${data.versionKey}, not found`,
        );
      }

      patient.versionKey = data.versionKey;
      patient.name = data.name;

      await patient.save({ transaction });

      await transaction.commit();

      msg.ack();

      logger.info(`Patient updated event handled with id=${data.id}`);
    } catch (error) {
      await transaction.rollback();
      logger.error(`Patient updated event with id=${data.id} failed with error ${error}`);
      throw error;
    }
  }
}
