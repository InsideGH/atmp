import { Subjects } from '../subjects';
import { ErrorEventData } from '../events/error-event-event';
import { PatientCreatedEventData } from '../events/patient-created-event';
import { PatientUpdatedEventData } from '../events/patient-updated-event';

export interface BaseEvent {
  subject: Subjects;
  data: ErrorEventData | PatientCreatedEventData | PatientUpdatedEventData;
}
