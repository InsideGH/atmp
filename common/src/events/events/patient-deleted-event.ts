import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface PatientDeletedEvent extends BaseEvent {
  subject: Subjects.PatientDeleted;
  data: {
    id: number;
    versionKey: number;
  };
}
