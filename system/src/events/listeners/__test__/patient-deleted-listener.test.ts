import { PatientDeletedEvent, Subjects } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { PatientDeletedListener } from '../patient-deleted-listener';
import { verifyEntry } from './verify-entry';

it('creates a patient event entry and acks the message', async () => {
  const socketWrapper = new global.SocketWrapper();

  const listener = new PatientDeletedListener(natsWrapper.client, socketWrapper);
  const subject = Subjects.PatientDeleted;
  const data: PatientDeletedEvent['data'] = {
    id: 666,
    versionKey: 0,
  };
  await verifyEntry<PatientDeletedEvent>(subject, listener, data);

  expect(socketWrapper.broadcast).toHaveBeenCalledTimes(1);
});
