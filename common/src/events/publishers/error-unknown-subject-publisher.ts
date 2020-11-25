import { Publisher } from '../base/base-publisher';
import { Subjects } from '../subjects';
import { ErrorUnknownSubject } from '../events/error-unknown-subject-event';

export class ErrorUnknownSubjectPublisher extends Publisher<ErrorUnknownSubject> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.ErrorUnknownSubject = Subjects.ErrorUnknownSubject;
}
