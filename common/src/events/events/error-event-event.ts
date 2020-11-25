import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface ErrorEventData {
  errorMessage: string;
  serviceName: string;
  errorEvent: {
    subject: string;
    data: any;
  };
}

export interface ErrorEvent extends BaseEvent {
  subject: Subjects.ErrorEvent;
  data: ErrorEventData;
}
