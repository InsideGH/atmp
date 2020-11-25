import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface PatientCreatedEventData {
  id: string;
  version: number;
  name: string;
}

export interface PatientCreatedEvent extends BaseEvent {
  subject: Subjects.PatientCreated;
  data: PatientCreatedEventData;
}
