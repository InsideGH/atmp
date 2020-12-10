import { Publisher, DeviceCreatedEvent, Subjects } from '@thelarsson/acss-common';

export class DeviceCreatedPublisher extends Publisher<DeviceCreatedEvent> {
  // Both to make sure that we never can change this value in the future.
  subject: Subjects.DeviceCreated = Subjects.DeviceCreated;
}
