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
        paranoid: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (patient) {
        if (data.versionKey <= patient.versionKey) {
          logger.info(
            `[EVENT] Patient ${patient.id}.${patient.versionKey} update IGNORED - old version ${data.id}.${data.versionKey}`,
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
        throw new Error(
          `[EVENT] Patient update FAIL - not exist to update with event ${data.id}.${data.versionKey}`,
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

// enum StrategyDecision {
//   IGNORE,
//   UPDATE,
//   FAIL,
// }

// class EventDbStrategy {
//   static update(
//     event: { id: number; versionKey: number },
//     curr: { id: number; versionKey: number },
//   ): StrategyDecision {
//     if (!curr) {
//       return StrategyDecision.FAIL;
//     }

//     if (event.versionKey <= curr.versionKey) {
//       return StrategyDecision.IGNORE;
//     }

//     if (event.versionKey - curr.versionKey == 1) {
//       return StrategyDecision.UPDATE;
//     }

//     return StrategyDecision.FAIL;
//   }
// }
