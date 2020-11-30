import { InternalPublisher } from '../internal-publisher';
import { PatientCreatedEvent } from '../../../events/events/patient-created-event';
import { Subjects } from '../../../events/subjects';
import { internalEventHandler } from '../../internal-event-handler';

import { Event } from '../models/event';

it('creates a PatientCreatedEvent event entry', async () => {
  const event: PatientCreatedEvent = {
    subject: Subjects.PatientCreated,
    data: {
      id: 1,
      name: 'cool event',
      versionKey: 0,
    },
  };

  const publisher = new InternalPublisher(event);

  const transaction = await global.db.sequelize.transaction();
  try {
    await publisher.createDbEntry(transaction);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
  }

  const events = await Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);

  expect(events.length).toEqual(1);
  expect(events[0].dataValues).toEqual({
    id: 1,
    subject: Subjects.PatientCreated,
    sent: false,
    data: {
      id: 1,
      name: 'cool event',
      versionKey: 0,
    },
  });

  await new Promise<void>((resolve) => {
    internalEventHandler.listen((id) => {
      expect(id).toEqual(1);
      resolve();
    });

    publisher.publish();
  });
});
