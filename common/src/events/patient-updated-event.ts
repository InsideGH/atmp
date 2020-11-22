import { Subjects } from './subjects';
import { Event } from './event';

export interface PatientUpdatedEvent extends Event {
  subject: Subjects.PatientUpdated;
  data: {
    id: string;
    version: number;
    name: string;
  };
}
