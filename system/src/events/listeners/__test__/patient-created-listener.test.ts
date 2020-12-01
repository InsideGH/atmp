import { PatientCreatedEvent, Subjects } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { PatientCreatedListener } from '../patient-created-listener';
import { verifyEntry } from './verify-entry';

it('creates a patient event entry and acks the message', async () => {
  const listener = new PatientCreatedListener(natsWrapper.client);
  const subject = Subjects.PatientCreated;
  const data: PatientCreatedEvent['data'] = {
    id: 666,
    name: 'kalle',
    versionKey: 0,
  };
  await verifyEntry<PatientCreatedEvent>(subject, listener, data);
});
