import { PatientCreatedEvent, Subjects, logger, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { createEvent } from './create-event';
import { SocketWrapper } from '../../socket/socket-wrapper';
import { SocketEventChannel } from '../../socket/socket-event-channel';

export class PatientCreatedListener extends Listener<PatientCreatedEvent> {
  subject: Subjects.PatientCreated = Subjects.PatientCreated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan, private socketWrapper: SocketWrapper, enableDebugLogs: boolean) {
    super(client, enableDebugLogs);
  }

  async onMessage(data: { id: number; versionKey: number; name: string }, msg: Message) {
    const event = await createEvent(data, msg);
    msg.ack();
    this.socketWrapper.broadcast(SocketEventChannel.NEW_EVENT, event);
  }
}
