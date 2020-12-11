import { Subjects } from '../subjects';
import { Services } from '../services';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */
export interface LogCreatedEvent extends BaseEvent {
  subject: Subjects.LogCreated;
  data: {
    service: Services;
    id: number;
  };
}
