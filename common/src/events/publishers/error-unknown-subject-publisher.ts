import { Publisher } from '../base/base-publisher';
import { Subjects } from '../subjects';
import { ErrorEvent } from '../events/error-event-event';

export class ErrorEventPublisher extends Publisher<ErrorEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.ErrorEvent = Subjects.ErrorEvent;
}
