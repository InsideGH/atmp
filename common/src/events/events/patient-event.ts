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
  type: PatientEventType.CREATE;
  id: number;
  versionKey: number;
  name: string;
}

export interface PatientUpdateData {
  type: PatientEventType.UPDATE;
  id: number;
  name: string;
  age: number;
}

export interface PatientDeleteData {
  type: PatientEventType.DELETE;
  id: number;
}

export interface PatientEvent extends BaseEvent {
  subject: Subjects.Patient;
  data: PatientCreateData | PatientUpdateData | PatientDeleteData;
}
