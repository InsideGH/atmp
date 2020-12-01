import { PatientCreatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { createEvent } from './create-event';

export class PatientCreatedListener extends Listener<PatientCreatedEvent> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  async onMessage(data: { id: number; versionKey: number; name: string }, msg: Message) {
    await createEvent(data, msg);
    msg.ack();
  }
}
