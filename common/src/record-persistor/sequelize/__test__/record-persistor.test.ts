import { RecordPersistor } from '../record-persistor';

import { Record } from '../models/record';
import { Services } from '../../../events/services';

class TestRecordPersistor extends RecordPersistor {
  protected service: Services = Services.patients;
}

it('creates a PatientCreatedEvent event entry', async () => {
  const recordPersistor = new TestRecordPersistor(global.client, 'This is a test message', {
    name: 'kalle',
  });

  const transaction = await global.db.sequelize.transaction();
  try {
    await recordPersistor.createDbEntry(transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
  }

  const events = await Record.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);

  expect(events.length).toEqual(1);
  expect(events[0].dataValues).toEqual({
    id: 1,
    msg: 'This is a test message',
    data: {
      name: 'kalle',
    },
  });

  let publishStatus;
  try {
    await recordPersistor.publishId();
    publishStatus = 'no_error';
  } catch (error) {
    publishStatus = 'error';
  }

  expect(publishStatus).toEqual('no_error');
});
