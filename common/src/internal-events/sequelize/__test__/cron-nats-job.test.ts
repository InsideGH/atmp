import { cronNatsJob } from '../cron-nats-job';
import { Subjects } from '../../../events/subjects';

import { Event } from '../models/event';
import { NatsPublisher } from '../nats-publisher';

import { natsWrapper } from '../../../nats/nats-wrapper';

it('sends a PatientCreatedEvent event to nats', async () => {
  const sequelizeNatsPublisher = new NatsPublisher(natsWrapper.client, 'test-cron');

  /**
   * Create an event in the database, not sent.
   */
  const event1 = await Event.create({
    data: {
      id: 666,
      kalle: 'kula',
    },
    subject: Subjects.PatientCreated,
    sent: false,
  });

  const event2 = await Event.create({
    data: {
      id: 667,
      musse: 'pigg',
    },
    subject: Subjects.PatientCreated,
    sent: true,
  });

  const event3 = await Event.create({
    data: {
      id: 668,
      lang: 'ben',
    },
    subject: Subjects.PatientCreated,
    sent: false,
  });

  const report = await cronNatsJob(sequelizeNatsPublisher);

  expect(report).toEqual(2);

  const allEvents = await Event.findAll({});

  expect(allEvents.length).toEqual(3);

  expect(allEvents[0].sent).toEqual(true);
  expect(allEvents[1].sent).toEqual(true);
  expect(allEvents[2].sent).toEqual(true);
});
