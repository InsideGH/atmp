import { Subjects } from '../events/subjects';
import { Publisher } from '../events/base/base-publisher';
import { LogCreatedEvent } from '../events/events/log-created-event';

/**
 * Used by the RecordPersistor in case an event should be sent.
 */
export class RecordPublisher extends Publisher<LogCreatedEvent> {
  subject: Subjects.LogCreated = Subjects.LogCreated;
}
