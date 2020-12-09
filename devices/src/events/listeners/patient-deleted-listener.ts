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
        paranoid: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (patient) {
        if (event.versionKey <= patient.versionKey) {
          logger.info(
            `[EVENT] Patient ${patient.id}.${patient.versionKey} delete IGNORED - old version ${event.id}.${event.versionKey}`,
          );
        } else if (event.versionKey - patient.versionKey == 1) {
          await patient.destroy({ transaction });
          await new DeviceRecord(this.client, 'Patient deleted', patient).createDbEntry(
            transaction,
          );
          logger.info(`[EVENT] Patient ${patient.id}.${patient.versionKey} delete OK`);
        } else {
          throw new Error(
            `[EVENT] Patient ${patient.id}.${patient.versionKey} delete FAIL - wrong version ${event.id}.${event.versionKey}`,
          );
        }
      } else {
        logger.info(`[EVENT] Patient ${event.id}.${event.versionKey} delete IGNORED - not found`);
      }

      await transaction.commit();
      msg.ack();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
