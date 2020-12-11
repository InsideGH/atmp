import { Subjects } from '../subjects';
import { BaseEvent } from '../base/base-event';

/**
 * Describe the event structure so that both publishers and listeners knows and
 * confirms to the structure.
 */
export interface DeviceCreatedEvent extends BaseEvent {
  subject: Subjects.DeviceCreated;
  data: {
    id: number;
    versionKey: number;
    type: string;
  };
}
