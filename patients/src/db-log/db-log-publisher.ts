import { Subjects, Publisher, LogCreatedEvent } from '@thelarsson/acss-common';

export class DbLogPublisher extends Publisher<LogCreatedEvent> {
  subject: Subjects.LogCreated = Subjects.LogCreated;
}
