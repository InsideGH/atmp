import { Publisher } from '../base/base-publisher';
import { Subjects } from '../subjects';
import { ErrorUnknownEvent } from '../events/error-unknown-event-event';

export class ErrorUnknownEventPublisher extends Publisher<ErrorUnknownEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.ErrorUnknownEvent = Subjects.ErrorUnknownEvent;
}
