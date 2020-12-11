import { Subjects } from '../subjects';
import { Services } from '../services';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */
export interface ErrorCreatedEvent extends BaseEvent {
  subject: Subjects.ErrorCreated;
  data: {
    service: Services;
    errorMessage: string;
    errorEvent: {
      subject: string;
      data: any;
    };
  };
}
