import { PatientUpdatedEvent, Subjects } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { PatientUpdatedListener } from '../patient-updated-listener';
import { verifyEntry } from './verify-entry';

it('creates a patient event entry and acks the message', async () => {
  const socketWrapper = new global.SocketWrapper();

  const listener = new PatientUpdatedListener(natsWrapper.client, socketWrapper);
  const subject = Subjects.PatientUpdated;
  const data: PatientUpdatedEvent['data'] = {
    id: 666,
    name: 'kalle',
    versionKey: 0,
    age: 4,
  };
  await verifyEntry<PatientUpdatedEvent>(subject, listener, data);

  expect(socketWrapper.broadcast).toHaveBeenCalledTimes(1);
});
