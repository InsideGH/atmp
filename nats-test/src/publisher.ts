/// <reference types="@types/node" />

import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
// import { TicketCreatedEvent } from './events/ticket-created-events';
// import { Subjects } from './events/subjects';

console.clear();

// stan is nats backwards, it's a client
// abc is client id
const stan = nats.connect('acss', 'abc', {
  url: 'http://localhost:4222',
});

// const publishTicketCreated = (data: {
//   id: string;
//   title: string;
//   price: number;
// }): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     stan.publish(Subjects.TicketCreated, JSON.stringify(data), (err) => {
//       if (err) {
//         return reject(err);
//       }
//       console.log('Event published to subject', Subjects.TicketCreated);
//       return resolve();
//     });
//   });
// };

stan.on('connect', async () => {
  console.log('publisher connected to NATS');

  const publisher = new TicketCreatedPublisher(stan);

  // await publishTicketCreated({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  await publisher.publish({
    id: '123',
    title: 'concert',
    price: new Date().getTime(),
  });

  // const data = JSON.stringify({
  //   id: '123',
  //   title: 'concert',
  //   price: 20,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});
