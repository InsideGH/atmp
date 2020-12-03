import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

export interface DeviceDeletedEvent extends BaseEvent {
  subject: Subjects.DeviceDeleted;
  data: {
    id: number;
    versionKey: number;
  };
}
