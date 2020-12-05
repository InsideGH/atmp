import { DeviceUpdatedEvent, Subjects } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { DeviceUpdatedListener } from '../device-updated-listener';
import { verifyEntry } from './verify-entry';

it('creates a device event entry and acks the message', async () => {
  const socketWrapper = new global.SocketWrapper();

  const listener = new DeviceUpdatedListener(natsWrapper.client, socketWrapper);
  const subject = Subjects.DeviceUpdated;
  const data: DeviceUpdatedEvent['data'] = {
    id: 666,
    type: 'watch',
    versionKey: 0,
  };
  await verifyEntry<DeviceUpdatedEvent>(subject, listener, data);
  expect(socketWrapper.broadcast).toHaveBeenCalledTimes(1);
});
