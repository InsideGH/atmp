import { Subjects } from './subjects';
import { BaseEvent } from './base/base-event';

export interface PatientUpdatedEvent extends BaseEvent {
  subject: Subjects.PatientUpdated;
  data: {
    id: string;
    version: number;
    name: string;
  };
}
