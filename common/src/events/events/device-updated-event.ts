import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface DeviceUpdatedEvent extends BaseEvent {
  subject: Subjects.DeviceUpdated;
  data: {
    id: number;
    versionKey: number;
    type: string;
    foo: number;
  };
}
