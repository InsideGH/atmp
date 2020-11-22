import { Subjects } from './subjects';
import { Event } from './event';

export interface PatientCreatedEvent extends Event {
  subject: Subjects.PatientCreated;
  data: {
    id: string;
    version: number;
    name: string;
  };
}
