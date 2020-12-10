import { Publisher, DeviceUpdatedEvent, Subjects } from '@thelarsson/acss-common';

export class DeviceUpdatedPublisher extends Publisher<DeviceUpdatedEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.DeviceUpdated = Subjects.DeviceUpdated;
}
