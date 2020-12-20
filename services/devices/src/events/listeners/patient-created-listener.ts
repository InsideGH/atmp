import { PatientCreatedEvent, Subjects, logger } from '@thelarsson/acss-common';
import { Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { DeviceRecord } from '../../record/device-record';
import { ReplicaCreateListener } from './base-create-listener';
import { Patient } from '../../sequelize/models/patient';
import { Transaction } from 'sequelize/types';

export class PatientCreatedListener extends ReplicaCreateListener<PatientCreatedEvent, Patient> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, { enableDebugLogs: false }, db.sequelize, Patient);
  }

  async onTransaction(data: PatientCreatedEvent['data'], row: Patient, transaction: Transaction): Promise<void> {
    await new DeviceRecord(this.client, 'Patient created', row).createDbEntry(transaction);
    logger.info(`[EVENT] Patient c OK - ${row.id}.${row.versionKey}`);
  }

  mapCreateCols(data: PatientCreatedEvent['data']) {
    return {
      id: data.id,
      name: data.name,
      versionKey: data.versionKey,
    };
  }

  infoIgnored(data: PatientCreatedEvent['data'], row: any): void {
    logger.info(`[EVENT] Patient c ACK(IGNORE) - ${data.id}.${data.versionKey} -| ${row.id}.${row.versionKey}`);
  }
}


