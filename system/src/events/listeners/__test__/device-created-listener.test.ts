import { DeviceCreatedEvent, Subjects } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { DeviceCreatedListener } from '../device-created-listener';
import { verifyEntry } from './verify-entry';

it('creates a device event entry and acks the message', async () => {
  const socketWrapper = new global.SocketWrapper();

  const listener = new DeviceCreatedListener(natsWrapper.client, socketWrapper);
  const subject = Subjects.DeviceCreated;
  const data: DeviceCreatedEvent['data'] = {
    id: 666,
    type: 'watch',
    versionKey: 0,
  };
  await verifyEntry<DeviceCreatedEvent>(subject, listener, data);
  expect(socketWrapper.broadcast).toHaveBeenCalledTimes(1);
});
