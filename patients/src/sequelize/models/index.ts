import { Patient, initPatient } from './patient';
import { eventPersistor, RecordPersistor } from '@thelarsson/acss-common';

const { Event, initEvent } = eventPersistor.getModel();
const { Record, initRecord } = RecordPersistor.getModel();

export const modelInits = [initPatient, initEvent, initRecord];

export const models = {
  Patient,
  Event,
  Record,
};
