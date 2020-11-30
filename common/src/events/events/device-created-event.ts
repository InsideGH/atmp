import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface DeviceCreatedEvent extends BaseEvent {
  subject: Subjects.DeviceCreated;
  data: {
    id: number;
    versionKey: number;
    type: string;
  };
}
