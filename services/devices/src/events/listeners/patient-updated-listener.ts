import { PatientUpdatedEvent, Subjects, logger, Listener, Decision, EventListenerLogic } from '@thelarsson/acss-common';
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
  async onMessage(event: { id: number; versionKey: number; name: string }, msg: Message): Promise<void> {
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findOne({
        where: {
          id: event.id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
        // TODO: Figure out if we need this or if it's the testcase that requires it
        paranoid: false,
      });

      const decision = EventListenerLogic.decision(event, patient);
      if (decision == Decision.HANDLE_AND_ACK) {
        if (patient) {
          await patient.update(
            {
              versionKey: event.versionKey,
              name: event.name,
            },
            { transaction },
          );
          await new DeviceRecord(this.client, 'Patient updated', patient).createDbEntry(transaction);
          logger.info(`[EVENT] Patient u OK - ${event.id}.${event.versionKey} -> ${patient.id}.${patient.versionKey}`);
        }
      } else if (decision == Decision.NO_ACK) {
        throw new Error(
          `[EVENT] Patient u NO_ACK - ${event.id}.${event.versionKey} -> ${patient ? `${patient.id}.${patient.versionKey}` : 'no patient exist'}`,
        );
      } else {
        logger.info(
          `[EVENT] Patient u ACK (IGNORE) - ${event.id}.${event.versionKey} -> ${patient ? `${patient.id}.${patient.versionKey}` : 'no patient exist'}`,
        );
      }

      await transaction.commit();

      msg.ack();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
