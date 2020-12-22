import { ReplicaCreatedListener } from '../replica-created-listener';
import { BaseEvent } from '../../../events/base/base-event';
import { Subjects } from '../../../events/subjects';
import { TableReplica } from '../../../test/models/table-replica';
import { Transaction } from 'sequelize/types';
import { logger } from '../../../logger/pino';

interface MyEvent extends BaseEvent {
  subject: Subjects.TestCreated;
  data: {
    id: number;
    versionKey: number;
    name: string;
  };
}

class MyCreatedListener extends ReplicaCreatedListener<MyEvent, TableReplica> {
  subject: Subjects.TestCreated = Subjects.TestCreated;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }, row: TableReplica, transaction: Transaction) => {});

  mapCreateCols = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }) => {
    return {
      id: data.id,
      name: data.name,
      versionKey: data.versionKey,
    };
  });

  infoIgnored? = jest.fn().mockImplementation((data: MyEvent['data'], row: any) => {});
}

it('does creates once and acks multiple times on re-create', async () => {
  const listener = new MyCreatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const data: MyEvent['data'] = {
    id: 1,
    name: 'kalle',
    versionKey: 1,
  };

  const data2: MyEvent['data'] = {
    id: 1,
    name: 'nisse',
    versionKey: 2,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestCreated;
    },
  };

  /**
   * Empty db
   */
  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(0);

  /**
   * One row in db according to event data.
   */
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalledTimes(1);
  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 1,
    age: null,
  });

  expect(listener.mapCreateCols).toHaveBeenCalledTimes(1);
  expect(listener.onTransaction).toHaveBeenCalledTimes(1);
  expect(listener.infoIgnored).toHaveBeenCalledTimes(0);

  /**
   * Still one row in db, unchanged even if we changed properties of the event, except the id.
   */
  await listener.onMessage(data2, msg);
  expect(msg.ack).toHaveBeenCalledTimes(2);
  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);

  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 1,
    age: null,
  });

  expect(listener.mapCreateCols).toHaveBeenCalledTimes(2);
  expect(listener.onTransaction).toHaveBeenCalledTimes(1);
  expect(listener.infoIgnored).toHaveBeenCalledTimes(1);

  /**
   * No error logs are to be expected
   */
  expect(logger.error).toHaveBeenCalledTimes(0);
});

class MyCreatedListenerThatThrows extends ReplicaCreatedListener<MyEvent, TableReplica> {
  subject: Subjects.TestCreated = Subjects.TestCreated;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }, row: TableReplica, transaction: Transaction) => {});

  mapCreateCols = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }) => {
    throw new Error('We test that ack is not called');
  });

  infoIgnored? = jest.fn().mockImplementation((data: MyEvent['data'], row: any) => {});
}

it('does not ack if error', async () => {
  const listener = new MyCreatedListenerThatThrows(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const data: MyEvent['data'] = {
    id: 1,
    name: 'kalle',
    versionKey: 1,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestCreated;
    },
  };

  /**
   * Empty db
   */
  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(0);

  /**
   * Ack has not been called, and nothing in the database has been created and any errors have been re trown.
   */
  let didError = false;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);
  expect(msg.ack).toHaveBeenCalledTimes(0);
  expect(listener.onTransaction).toHaveBeenCalledTimes(0);
  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(0);
  expect(listener.mapCreateCols).toHaveBeenCalledTimes(1);
  expect(logger.error).toHaveBeenCalledTimes(1);
});

it('can handle many calls', async () => {
  /**
   * We are using sqlite3 in test which does not handle transactions within transactions.
   */
  const listener = new MyCreatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const data: MyEvent['data'] = {
    id: 1,
    name: 'kalle',
    versionKey: 1,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestCreated;
    },
  };

  /**
   * Empty db
   */
  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(0);

  /**
   * One row in db according to event data. We must await the onMessage (sqlite3 can't handle transactions within transactions)
   */
  const proms = [];
  for (let i = 0; i < 100; i++) {
    proms.push(await listener.onMessage(data, msg));
  }
  expect(msg.ack).toHaveBeenCalledTimes(100);
  expect(listener.mapCreateCols).toHaveBeenCalledTimes(100);
  expect(listener.onTransaction).toHaveBeenCalledTimes(1);
});
