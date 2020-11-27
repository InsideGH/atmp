import { cronNatsJob } from '../cron-nats-job';
import { Subjects } from '@thelarsson/acss-common';

import { models } from '../../../sequelize/models';
import { NatsPublisher } from '../nats-publisher';

it('sends a PatientCreatedEvent event to nats', async () => {
  const sequelizeNatsPublisher = new NatsPublisher();

  /**
   * Create an event in the database, not sent.
   */
  const event1 = await models.Event.create({
    data: {
      id: 666,
      kalle: 'kula',
    },
    subject: Subjects.PatientCreated,
    sent: false,
  });

  const event2 = await models.Event.create({
    data: {
      id: 667,
      musse: 'pigg',
    },
    subject: Subjects.PatientCreated,
    sent: true,
  });

  const event3 = await models.Event.create({
    data: {
      id: 668,
      lang: 'ben',
    },
    subject: Subjects.PatientCreated,
    sent: false,
  });

  const report = await cronNatsJob(sequelizeNatsPublisher);

  expect(report).toEqual(2);

  const allEvents = await models.Event.findAll({});

  expect(allEvents.length).toEqual(3);

  expect(allEvents[0].sent).toEqual(true);
  expect(allEvents[1].sent).toEqual(true);
  expect(allEvents[2].sent).toEqual(true);
});
