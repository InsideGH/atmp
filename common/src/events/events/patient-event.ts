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

export interface PatientCreatedEvent2 extends BaseEvent {
  subject: Subjects.Patient;
  data: {
    type: PatientEventType.CREATE;
    id: number;
    name: string;
  };
}

export interface PatientUpdatedEvent2 extends BaseEvent {
  subject: Subjects.Patient;
  data: {
    type: PatientEventType.UPDATE;
    id: number;
    name: string;
    age: number;
  };
}

export interface PatientDeletedEvent2 extends BaseEvent {
  subject: Subjects.Patient;
  data: {
    type: PatientEventType.DELETE;
    id: number;
  };
}
