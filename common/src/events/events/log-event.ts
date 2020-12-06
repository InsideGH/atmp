import { Subjects } from '../subjects';
import { Services } from '../services';
import { BaseEvent } from '../base/base-event';

export interface LogCreatedEvent extends BaseEvent {
  subject: Subjects.LogCreated;
  data: {
    service: Services;
    id: number;
  };
}
