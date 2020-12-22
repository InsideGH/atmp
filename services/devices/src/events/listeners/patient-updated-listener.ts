import { PatientUpdatedEvent, Subjects, logger, ReplicaUpdatedListener } from '@thelarsson/acss-common';
import { Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { Patient } from '../../sequelize/models/patient';
import { DeviceRecord } from '../../record/device-record';
import { Transaction } from 'sequelize/types';

export class PatientUpdatedListener extends ReplicaUpdatedListener<PatientUpdatedEvent, Patient> {
  subject: Subjects.PatientUpdated = Subjects.PatientUpdated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, { enableDebugLogs: false }, db.sequelize, Patient);
  }

  async onTransaction(data: PatientUpdatedEvent['data'], row: Patient, transaction: Transaction): Promise<void> {
    await new DeviceRecord(this.client, 'Patient updated', row).createDbEntry(transaction);
    logger.info(`[EVENT] Patient u [OK      ] ${data.id}.${data.versionKey} -> ${row.id}.${row.versionKey - 1}`);
  }

  mapUpdateCols(data: PatientUpdatedEvent['data']) {
    return {
      versionKey: data.versionKey,
      name: data.name,
      age: data.age,
    };
  }

  infoIgnored(data: PatientUpdatedEvent['data'], row?: any): void {
    logger.info(`[EVENT] Patient u [ACK(IGN)] ${data.id}.${data.versionKey} -| ${row ? `${row.id}.${row.versionKey}` : 'no patient exist'}`);
  }

  infoNotThisTime(data: PatientUpdatedEvent['data'], row?: any): void {
    logger.info(`[EVENT] Patient u [NO_ACK  ] ${data.id}.${data.versionKey} -| ${row ? `${row.id}.${row.versionKey}` : 'no patient exist'}`);
  }
}
