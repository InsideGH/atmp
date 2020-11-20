import Patient, { PatientInterface } from './patient';
import Event, { EventInterface } from './event';

export interface Models {
  Patient: PatientInterface;
  Event: EventInterface;
}

export const models = {
  Patient,
  Event,
};
