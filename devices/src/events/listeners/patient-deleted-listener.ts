import { PatientDeletedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';
import { DeviceRecord } from '../../record/device-record';

export class PatientDeletedListener extends Listener<PatientDeletedEvent> {
  subject: Subjects.PatientDeleted = Subjects.PatientDeleted;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, {
      enableDebugLogs: false,
    });
  }

  /**
   * We only want to throw back the event if everything is OK except the versionKey.
   *
   */
  async onMessage(event: { id: number; versionKey: number }, msg: Message): Promise<void> {
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findOne({
        where: {
          id: event.id,
        },
        transaction,
      });

      if (patient) {
        if (event.versionKey - patient.versionKey == 0) {
          await patient.destroy({ transaction });
          await new DeviceRecord(this.client, 'Patient deleted', patient).createDbEntry(
            transaction,
          );
          logger.info(`[EVENT] Patient id=${patient.id}.${patient.versionKey} deleted`);
        } else {
          throw new Error(
            `Can't delete patient id=${patient.id}.${patient.versionKey}, event=${event.id}.${event.versionKey}`,
          );
        }
      } else {
        logger.info(`[EVENT] Patient id=${event.id}.${event.versionKey} delete ignored, not found`);
      }

      await transaction.commit();
      msg.ack();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
