import { Subjects } from '../subjects';
import { Services } from '../services';
import { BaseEvent } from '../base/base-event';

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
