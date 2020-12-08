import { Patient, initPatient } from './patient';
import { Device, initDevice } from './device';
import { eventPersistor, RecordPersistor } from '@thelarsson/acss-common';

const { Event, initEvent } = eventPersistor.getModel();
const { Record, initRecord } = RecordPersistor.getModel();

export const modelInits = [initPatient, initDevice, initEvent, initRecord];

export const models = {
  Patient,
  Device,
  Event,
  Record
};
