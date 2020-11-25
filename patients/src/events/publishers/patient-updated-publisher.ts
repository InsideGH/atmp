import { Publisher, PatientUpdatedEvent, Subjects } from '@thelarsson/acss-common';

export class PatientUpdatedPublisher extends Publisher<PatientUpdatedEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.PatientUpdated = Subjects.PatientUpdated;
}
