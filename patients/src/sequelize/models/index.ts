import { Patient, initPatient } from './patient';
import { eventPersistor } from '@thelarsson/acss-common';
import { RecordPersistor } from '../../record/sequelize/record-persistor';

const { Event, initEvent } = eventPersistor.getModel();
const { Record, initRecord } = RecordPersistor.getModel();

export const modelInits = [initPatient, initEvent, initRecord];

export const models = {
  Patient,
  Event,
  Record,
};
