import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface ErrorUnknownSubject extends BaseEvent {
  subject: Subjects.ErrorUnknownSubject;
  data: {
    errorMessage: string;
    serviceName: string;
    unknownEvent: {
      subject: string;
      data: any;
    };
  };
}
