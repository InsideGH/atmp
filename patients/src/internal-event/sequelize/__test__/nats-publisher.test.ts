import { NatsPublisher } from '../nats-publisher';
import { Subjects } from '@thelarsson/acss-common';

import { models } from '../../../sequelize/models';

it('sends a PatientCreatedEvent event to nats', async () => {
  const natsPublisher = new NatsPublisher();

  /**
   * Create an event in the database, not sent.
   */
  const event = await models.Event.create({
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

  const checkEvent = await models.Event.findOne({
    where: {
      id: event.id,
      sent: true,
    },
  });

  expect(checkEvent!.id).toEqual(1);
  expect(checkEvent!.data.id).toEqual(666);
  expect(checkEvent!.sent).toEqual(true);
});
