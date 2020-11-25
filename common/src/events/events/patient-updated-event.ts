import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface PatientUpdatedEventData {
  id: string;
  version: number;
  name: string;
  age: number;
}

export interface PatientUpdatedEvent extends BaseEvent {
  subject: Subjects.PatientUpdated;
  data: PatientUpdatedEventData;
}
