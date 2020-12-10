import { Publisher, PatientCreatedEvent, Subjects } from '@thelarsson/acss-common';

export class PatientCreatedPublisher extends Publisher<PatientCreatedEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
}
