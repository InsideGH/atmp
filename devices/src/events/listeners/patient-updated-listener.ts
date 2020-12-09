import { PatientUpdatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { models } from '../../sequelize/models';
import { DeviceRecord } from '../../record/device-record';

export class PatientUpdatedListener extends Listener<PatientUpdatedEvent> {
  subject: Subjects.PatientUpdated = Subjects.PatientUpdated;
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
        lock: transaction.LOCK.UPDATE,
      });

      if (patient) {
        if (data.versionKey <= patient.versionKey) {
          logger.info(
            `[EVENT] Patient ${data.id}.${data.versionKey} update IGNORED - already updated version ${data.id}.${data.versionKey}`,
          );
        } else if (data.versionKey - patient.versionKey == 1) {
          await patient.update(
            {
              versionKey: data.versionKey,
              name: data.name,
            },
            { transaction },
          );
          await new DeviceRecord(this.client, 'Patient updated', patient).createDbEntry(
            transaction,
          );
          logger.info(`[EVENT] Patient ${patient.id}.${patient.versionKey} update OK`);
        } else {
          throw new Error(
            `[EVENT] Patient ${patient.id}.${patient.versionKey} update FAIL - wrong version ${data.id}.${data.versionKey}`,
          );
        }
      } else {
        logger.info(`[EVENT] Patient ${data.id}.${data.versionKey} update IGNORED - not found`);
      }

      await transaction.commit();

      msg.ack();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
