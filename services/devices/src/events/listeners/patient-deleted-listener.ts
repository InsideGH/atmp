import { PatientDeletedEvent, Subjects, logger } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import db from '../../sequelize/database';
import { Patient } from '../../sequelize/models/patient';
import { DeviceRecord } from '../../record/device-record';
import { ReplicaDeletedListener } from './base-deleted-listener';
import { Transaction } from 'sequelize/types';

export class PatientDeletedListener extends ReplicaDeletedListener<PatientDeletedEvent, Patient> {
  subject: Subjects.PatientDeleted = Subjects.PatientDeleted;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan) {
    super(client, { enableDebugLogs: false }, db.sequelize, Patient);
  }

  async onTransaction(data: { id: number; versionKey: number }, row: Patient, transaction: Transaction): Promise<void> {
    await new DeviceRecord(this.client, 'Patient deleted', row).createDbEntry(transaction);
    logger.info(`[EVENT] Patient d OK - ${data.id}.${data.versionKey} -> ${row.id}.${row.versionKey}`);
  }

  infoIgnored(data: { id: number; versionKey: number }, row?: any): void {
    logger.info(`[EVENT] Patient d ACK(IGNORE) - ${data.id}.${data.versionKey} -> ${row ? `${row.id}.${row.versionKey}` : 'no patient exist'}`);
  }

  infoNotThisTime(data: { id: number; versionKey: number }, row?: any): void {
    logger.info(`[EVENT] Patient d NO_ACK - ${data.id}.${data.versionKey} -> ${row ? `${row.id}.${row.versionKey}` : 'no exist'}`);
  }
}
