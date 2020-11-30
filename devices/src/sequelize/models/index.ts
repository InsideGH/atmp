import { Patient, initPatient } from './patient';
import { Device, initDevice } from './device';
import { eventPersistor } from '@thelarsson/acss-common';

const { Event, initEvent } = eventPersistor.getModel();

export const modelInits = [initPatient, initEvent];

export const models = {
  Patient,
  Event,
};
