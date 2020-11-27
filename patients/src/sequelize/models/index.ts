import { Patient, initPatient } from './patient';
import { Event, initEvent } from './event';

export const modelInits = [initPatient, initEvent];

export const models = {
  Patient,
  Event,
};
