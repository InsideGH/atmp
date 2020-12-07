import { Subjects, Publisher, LogCreatedEvent } from '@thelarsson/acss-common';

export class RecordPublisher extends Publisher<LogCreatedEvent> {
  subject: Subjects.LogCreated = Subjects.LogCreated;
}
