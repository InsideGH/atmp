import { PatientUpdatedEvent, Subjects, Listener } from '@thelarsson/acss-common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { createEvent } from './create-event';

export class PatientUpdatedListener extends Listener<PatientUpdatedEvent> {
  subject: Subjects.PatientUpdated = Subjects.PatientUpdated;
  queueGroupName: string = queueGroupName;

  async onMessage(
    data: { id: number; versionKey: number; name: string; age: number },
    msg: Message,
  ): Promise<void> {
    await createEvent(data, msg);
    msg.ack();
  }
}
