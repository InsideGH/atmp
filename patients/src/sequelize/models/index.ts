import { Patient, initPatient } from './patient';
import { eventPersistor } from '@thelarsson/acss-common';
import { DbLog } from '../../db-log/sequelize/db-log';

const { Event, initEvent } = eventPersistor.getModel();
const { Log, initLog } = DbLog.getModel();

export const modelInits = [initPatient, initEvent, initLog];

export const models = {
  Patient,
  Event,
  Log,
};
