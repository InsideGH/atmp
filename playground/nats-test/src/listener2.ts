import { randomBytes } from 'crypto';
import nats from 'node-nats-streaming';

import { TicketCreatedListener2 } from './events/ticket-created-listener2';

console.clear();

const stan = nats.connect('acss', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed!!');
    process.exit();
  });

  new TicketCreatedListener2(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
