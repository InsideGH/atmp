import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface PatientCreatedEvent extends BaseEvent {
  subject: Subjects.PatientCreated;
  data: {
    id: string;
    versionKey: number;
    name: string;
  };
}
