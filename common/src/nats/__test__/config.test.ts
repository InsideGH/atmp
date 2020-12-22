import { Message } from 'node-nats-streaming';
import { natsConstants, parseNatsMessage } from '../config';

it('is a common config', () => {
  expect(natsConstants).toBeDefined();
  expect(natsConstants).toEqual({
    ackWait: 5 * 1000,
  });
});

it('parses nats message', () => {
  const data = {
    name: 'kalle',
    age: 10,
  };

  //@ts-ignore
  const msg: Message = {
    getData: () => JSON.stringify(data),
  };

  const res = parseNatsMessage(msg);
  expect(res).toEqual(data);
});
