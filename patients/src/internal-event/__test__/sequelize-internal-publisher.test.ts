import { SequelizeInternalPublisher } from '../sequelize-internal-publisher';
import { PatientCreatedEvent, Subjects, internalEventHandler } from '@thelarsson/acss-common';

import db from '../../sequelize/database';
import { models } from '../../sequelize/models';

it('creates a PatientCreatedEvent event entry', async () => {
  const event: PatientCreatedEvent = {
    subject: Subjects.PatientCreated,
    data: {
      id: '1',
      name: 'cool event',
      versionKey: 0,
    },
  };

  const publisher = new SequelizeInternalPublisher(event);

  const transaction = await db.sequelize.transaction();
  try {
    await publisher.createDbEntry(transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
  }

  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);

  expect(events.length).toEqual(1);
  expect(events[0].dataValues).toEqual({
    id: 1,
    subject: Subjects.PatientCreated,
    sent: false,
    data: {
      id: '1',
      name: 'cool event',
      versionKey: 0,
    },
  });

  await new Promise<void>((resolve) => {
    internalEventHandler.listen((id: string) => {
      expect(id).toEqual(1);
      resolve();
    });

    publisher.publish();
  });
});
