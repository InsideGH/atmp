import { ReplicaCreatedListener } from '../replica-created-listener';
import { ReplicaUpdatedListener } from '../replica-updated-listener';
import { BaseEvent } from '../../../events/base/base-event';
import { Subjects } from '../../../events/subjects';
import { TableReplica } from '../../../test/models/table-replica';
import { Transaction } from 'sequelize/types';
import { logger } from '../../../logger/pino';

interface MyCreatedEvent extends BaseEvent {
  subject: Subjects.TestCreated;
  data: {
    id: number;
    versionKey: number;
    name: string;
  };
}

interface MyUpdatedEvent extends BaseEvent {
  subject: Subjects.TestUpdated;
  data: {
    id: number;
    versionKey: number;
    name: string;
    age?: number;
  };
}

class MyCreatedListener extends ReplicaCreatedListener<MyCreatedEvent, TableReplica> {
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

  infoIgnored? = jest.fn().mockImplementation((data: MyCreatedEvent['data'], row: any) => {});
}

class MyUpdatedListener extends ReplicaUpdatedListener<MyUpdatedEvent, TableReplica> {
  subject: Subjects.TestUpdated = Subjects.TestUpdated;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }, row: TableReplica, transaction: Transaction) => {});

  mapUpdateCols = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string; age: number }) => {
    return {
      id: data.id,
      name: data.name,
      versionKey: data.versionKey,
      age: data.age,
    };
  });

  infoIgnored? = jest.fn().mockImplementation((data: MyUpdatedEvent['data'], row: any) => {});
  infoNotThisTime? = jest.fn().mockImplementation((data: MyUpdatedEvent['data'], row: any) => {});
}

const setupCreate = async (versionKey: number) => {
  const createListener = new MyCreatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const createData: MyCreatedEvent['data'] = {
    id: 1,
    name: 'kalle',
    versionKey,
  };

  //@ts-ignore
  let createMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestCreated;
    },
  };

  /**
   * One row in db according to event data.
   */
  await createListener.onMessage(createData, createMsg);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey,
    age: null,
  });
};

it('does update and ack when updates', async () => {
  await setupCreate(1);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const updateData: MyUpdatedEvent['data'] = {
    id: 1,
    name: 'nisse',
    versionKey: 2,
    age: 454,
  };

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  await updateListener.onMessage(updateData, updateMsg);
  expect(updateListener.mapUpdateCols).toHaveBeenCalledTimes(1);
  expect(updateListener.onTransaction).toHaveBeenCalledTimes(1);
  expect(updateListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(updateListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(updateMsg.ack).toHaveBeenCalledTimes(1);
  expect(logger.error).toHaveBeenCalledTimes(0);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'nisse',
    versionKey: 2,
    age: 454,
  });
});

it('does not update or ack when non existing id', async () => {
  await setupCreate(1);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const updateData: MyUpdatedEvent['data'] = {
    id: 666,
    name: 'nisse',
    versionKey: 666,
    age: 454,
  };

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  /**
   * We can stress test by spamming updates with wrong ID because the implementation does not
   * use transaction when detecting wrong id.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = updateListener.onMessage(updateData, updateMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(updateListener.infoNotThisTime).toHaveBeenCalledTimes(20);

  expect(updateListener.mapUpdateCols).toHaveBeenCalledTimes(0);
  expect(updateListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(updateListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(updateMsg.ack).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 1,
    age: null,
  });
});

it('does not update or ack when future versionKey', async () => {
  await setupCreate(1);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const updateData: MyUpdatedEvent['data'] = {
    id: 1,
    name: 'nisse',
    versionKey: 666,
    age: 454,
  };

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  /**
   * We can stress test by spamming updates with wrong ID because the implementation does not
   * use transaction when detecting wrong id.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = updateListener.onMessage(updateData, updateMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(updateListener.infoNotThisTime).toHaveBeenCalledTimes(20);

  expect(updateListener.mapUpdateCols).toHaveBeenCalledTimes(0);
  expect(updateListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(updateListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(updateMsg.ack).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 1,
    age: null,
  });
});

it('does not update BUT acks when older versionKey is received', async () => {
  await setupCreate(5);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const updateData: MyUpdatedEvent['data'] = {
    id: 1,
    name: 'nisse',
    versionKey: 4,
    age: 454,
  };

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  /**
   * We can stress test by spamming updates with wrong versionKey because the implementation does not
   * use transaction when detecting this.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = updateListener.onMessage(updateData, updateMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(updateListener.infoIgnored).toHaveBeenCalledTimes(20);
  expect(updateMsg.ack).toHaveBeenCalledTimes(20);

  expect(updateListener.mapUpdateCols).toHaveBeenCalledTimes(0);
  expect(updateListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(updateListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 5,
    age: null,
  });
});

it('does not update BUT acks when same versionKey is received', async () => {
  await setupCreate(5);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const updateData: MyUpdatedEvent['data'] = {
    id: 1,
    name: 'nisse',
    versionKey: 5,
    age: 454,
  };

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  /**
   * We can stress test by spamming updates with wrong versionKey because the implementation does not
   * use transaction when detecting this.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = updateListener.onMessage(updateData, updateMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(updateListener.infoIgnored).toHaveBeenCalledTimes(20);
  expect(updateMsg.ack).toHaveBeenCalledTimes(20);

  expect(updateListener.mapUpdateCols).toHaveBeenCalledTimes(0);
  expect(updateListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(updateListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'kalle',
    versionKey: 5,
    age: null,
  });
});

class MyUpdatedListenerThatThrows extends ReplicaUpdatedListener<MyUpdatedEvent, TableReplica> {
  subject: Subjects.TestUpdated = Subjects.TestUpdated;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }, row: TableReplica, transaction: Transaction) => {
    throw new Error('It must throw');
  });

  mapUpdateCols = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string; age: number }) => {
    throw new Error('It must throw');
  });

  infoIgnored? = jest.fn().mockImplementation((data: MyUpdatedEvent['data'], row: any) => {
    throw new Error('It must throw');
  });
  infoNotThisTime? = jest.fn().mockImplementation((data: MyUpdatedEvent['data'], row: any) => {
    throw new Error('It must throw');
  });
}

it('throws when we want it to do', async () => {
  await setupCreate(5);

  const updateListener = new MyUpdatedListenerThatThrows(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  let didError;

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 666,
        name: 'nisse',
        versionKey: 666,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 1,
        name: 'nisse',
        versionKey: 10,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 1,
        name: 'nisse',
        versionKey: 4,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 1,
        name: 'nisse',
        versionKey: 5,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 1,
        name: 'nisse',
        versionKey: 2,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await updateListener.onMessage(
      {
        id: 1,
        name: 'nisse',
        versionKey: 6,
        age: 454,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);
});

it('optional field in event, updates accordingly', async () => {
  await setupCreate(1);

  const updateListener = new MyUpdatedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  //@ts-ignore
  let updateMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestUpdated;
    },
  };

  await updateListener.onMessage(
    {
      id: 1,
      name: 'nisse',
      versionKey: 2,
      age: 454,
    },
    updateMsg,
  );

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'nisse',
    versionKey: 2,
    age: 454,
  });

  await updateListener.onMessage(
    {
      id: 1,
      name: 'nisse',
      versionKey: 3,
    },
    updateMsg,
  );

  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'nisse',
    versionKey: 3,
    age: 454,
  });

  await updateListener.onMessage(
    {
      id: 1,
      name: 'john doe',
      versionKey: 4,
    },
    updateMsg,
  );

  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);
  global.stripKeys(replicaRows[0].dataValues, ['createdAt', 'deletedAt', 'updatedAt']);
  expect(replicaRows[0].dataValues).toEqual({
    id: 1,
    name: 'john doe',
    versionKey: 4,
    age: 454,
  });
});
