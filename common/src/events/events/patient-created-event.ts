import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */
export interface PatientCreatedEvent extends BaseEvent {
  subject: Subjects.PatientCreated;
  data: {
    id: number;
    versionKey: number;
    name: string;
  };
}
