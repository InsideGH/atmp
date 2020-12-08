import { Publisher } from '../base/base-publisher';
import { Subjects } from '../subjects';
import { ErrorCreatedEvent } from '../events/error-created-event';

export class ErrorCreatedPublisher extends Publisher<ErrorCreatedEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.ErrorCreated = Subjects.ErrorCreated;
}
