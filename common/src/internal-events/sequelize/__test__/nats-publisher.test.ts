import { NatsPublisher } from '../nats-publisher';
import { Subjects } from '../../../events/subjects';

import { Event } from '../models/event';
import { natsWrapper } from '../../../nats/nats-wrapper';

it('sends a PatientCreatedEvent event to nats', async () => {
  const natsPublisher = new NatsPublisher(natsWrapper.client, 'test-direct');

  /**
   * Create an event in the database, not sent.
   */
  const event = await Event.create({
    data: {
      id: 666,
      kalle: 'kula',
    },
    subject: Subjects.PatientCreated,
    sent: false,
  });

  /**
   * Make sequelizeNatsPublisher listen to internal events, so that it publishes the event and sets the event in the database as 'sent'.
   */
  await natsPublisher.sendEvent(event.id);

  const checkEvent = await Event.findOne({
    where: {
      id: event.id,
      sent: true,
    },
  });

  expect(checkEvent!.id).toEqual(1);
  expect(checkEvent!.data.id).toEqual(666);
  expect(checkEvent!.sent).toEqual(true);
});
