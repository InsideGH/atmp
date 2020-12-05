import { DeviceCreatedEvent, Subjects, Listener } from '@thelarsson/acss-common';
import { Message, Stan } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { createEvent } from './create-event';
import { SocketWrapper } from '../../socket/socket-wrapper';
import { SocketEventChannel } from '../../socket/socket-event-channel';

export class DeviceCreatedListener extends Listener<DeviceCreatedEvent> {
  subject: Subjects.DeviceCreated = Subjects.DeviceCreated;
  queueGroupName: string = queueGroupName;

  constructor(client: Stan, private socketWrapper: SocketWrapper) {
    super(client, {
      enableDebugLogs: true,
    });
  }

  async onMessage(
    data: { id: number; versionKey: number; type: string },
    msg: Message,
  ): Promise<void> {
    const event = await createEvent(data, msg);
    msg.ack();
    this.socketWrapper.broadcast(SocketEventChannel.NEW_EVENT, event);
  }
}
