/// <reference types="@types/node" />

import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-events';
import { Subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  // we need to set the type so that we can't change it in the future.
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log(`[${msg.getSequence()}] message received ${this.subject} / ${this.queueGroupName}`);
    console.log(`[${msg.getSequence()}] event: `, data);

    msg.ack();
  }
}
