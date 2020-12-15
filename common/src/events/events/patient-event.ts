import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */

export enum PatientEventType {
  CREATE,
  UPDATE,
  DELETE,
}

export interface PatientCreateData {
  id: number;
  versionKey: number;
  name: string;
}

export interface PatientUpdateData {
  id: number;
  name: string;
  age: number;
}

export interface PatientDeleteData {
  id: number;
}

export interface PatientEvent extends BaseEvent {
  subject: Subjects.Patient;
  data: {
    type: PatientEventType;
    payload: PatientCreateData | PatientUpdateData | PatientDeleteData;
  };
}
