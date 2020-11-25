import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface ErrorUnknownEvent extends BaseEvent {
  subject: Subjects.ErrorUnknownEvent;
  data: {
    errorMessage: string;
    serviceName: string;
    unknownEvent: {
      subject: string;
      data: any;
    };
  };
}
