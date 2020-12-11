import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */
export interface PatientUpdatedEvent extends BaseEvent {
  subject: Subjects.PatientUpdated;
  data: {
    id: number;
    versionKey: number;
    name: string;
    age: number;
  };
}
