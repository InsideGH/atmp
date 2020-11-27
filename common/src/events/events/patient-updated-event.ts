import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface PatientUpdatedEvent extends BaseEvent {
  subject: Subjects.PatientUpdated;
  data: {
    id: number;
    versionKey: number;
    name: string;
    age: number;
  };
}
