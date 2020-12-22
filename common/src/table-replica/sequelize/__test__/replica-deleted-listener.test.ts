import { ReplicaCreatedListener } from '../replica-created-listener';
import { ReplicaUpdatedListener } from '../replica-updated-listener';
import { BaseEvent } from '../../../events/base/base-event';
import { Subjects } from '../../../events/subjects';
import { TableReplica } from '../../../test/models/table-replica';
import { Transaction } from 'sequelize/types';
import { logger } from '../../../logger/pino';
import { ReplicaDeletedListener } from '../replica-deleted-listener';

interface MyCreateEvent extends BaseEvent {
  subject: Subjects.TestCreated;
  data: {
    id: number;
    versionKey: number;
    name: string;
  };
}

interface MyDeletedEvent extends BaseEvent {
  subject: Subjects.TestDeleted;
  data: {
    id: number;
    versionKey: number;
  };
}

class MyCreatedListener extends ReplicaCreatedListener<MyCreateEvent, TableReplica> {
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

  infoIgnored? = jest.fn().mockImplementation((data: MyCreateEvent['data'], row: any) => {});
}

class MyDeletedListener extends ReplicaDeletedListener<MyDeletedEvent, TableReplica> {
  subject: Subjects.TestDeleted = Subjects.TestDeleted;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number }, row: TableReplica, transaction: Transaction) => {});

  infoIgnored? = jest.fn().mockImplementation((data: MyDeletedEvent['data'], row: any) => {});

  infoNotThisTime? = jest.fn().mockImplementation((data: MyDeletedEvent['data'], row: any) => {});
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

  const createData: MyCreateEvent['data'] = {
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

it('does update and ack when deleted', async () => {
  await setupCreate(1);

  const deleteListener = new MyDeletedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const deleteData: MyDeletedEvent['data'] = {
    id: 1,
    versionKey: 2,
  };

  //@ts-ignore
  let deleteMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestDeleted;
    },
  };

  let replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(1);

  await deleteListener.onMessage(deleteData, deleteMsg);
  expect(deleteListener.onTransaction).toHaveBeenCalledTimes(1);
  expect(deleteListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(deleteListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(deleteMsg.ack).toHaveBeenCalledTimes(1);
  expect(logger.error).toHaveBeenCalledTimes(0);

  replicaRows = await TableReplica.findAll({});
  expect(replicaRows.length).toEqual(0);

  /**
   * Since delete is based on same logic as update, we expect the versionKey
   * to have been increased (set to the same as the delete event versionKey)
   */
  replicaRows = await TableReplica.findAll({ paranoid: false });
  expect(replicaRows.length).toEqual(1);
  expect(replicaRows[0].dataValues.versionKey).toEqual(2);
});

it('does not-this-time when non existing id is given since same EventListenerLogic is used for udpate and delete', async () => {
  const deleteListener = new MyDeletedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const deleteData: MyDeletedEvent['data'] = {
    id: 666,
    versionKey: 2,
  };

  //@ts-ignore
  let deleteMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestDeleted;
    },
  };

  /**
   * We can stress test by spamming deleted with wrong ID because the implementation does not
   * use transaction when detecting wrong id.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = await deleteListener.onMessage(deleteData, deleteMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(deleteListener.infoNotThisTime).toHaveBeenCalledTimes(20);
  expect(deleteListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(deleteListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(deleteMsg.ack).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);
});

it('does not-this-time when future versionKey is given since same EventListenerLogic is used for udpate and delete', async () => {
  await setupCreate(1);

  const deleteListener = new MyDeletedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const deleteData: MyDeletedEvent['data'] = {
    id: 1,
    versionKey: 666,
  };

  //@ts-ignore
  let deleteMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestDeleted;
    },
  };

  /**
   * We can stress test by spamming deleted with wrong versionKey because the implementation does not
   * use transaction when detecting wrong versionKey.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = await deleteListener.onMessage(deleteData, deleteMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(deleteListener.infoNotThisTime).toHaveBeenCalledTimes(20);
  expect(deleteListener.infoIgnored).toHaveBeenCalledTimes(0);
  expect(deleteListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(deleteMsg.ack).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);
});

it('does ignore when older versionKey is given since same EventListenerLogic is used for udpate and delete', async () => {
  await setupCreate(5);

  const deleteListener = new MyDeletedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const deleteData: MyDeletedEvent['data'] = {
    id: 1,
    versionKey: 3,
  };

  //@ts-ignore
  let deleteMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestDeleted;
    },
  };

  /**
   * We can stress test by spamming deleted with wrong ID because the implementation does not
   * use transaction when detecting wrong id.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = await deleteListener.onMessage(deleteData, deleteMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(deleteListener.infoIgnored).toHaveBeenCalledTimes(20);
  expect(deleteMsg.ack).toHaveBeenCalledTimes(20);
  expect(deleteListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(deleteListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);
});

it('does ignore when same versionKey is given since same EventListenerLogic is used for udpate and delete', async () => {
  await setupCreate(5);

  const deleteListener = new MyDeletedListener(
    global.client,
    {
      enableDebugLogs: false,
    },
    global.db.sequelize,
    TableReplica,
  );

  const deleteData: MyDeletedEvent['data'] = {
    id: 1,
    versionKey: 5,
  };

  //@ts-ignore
  let deleteMsg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
    getSubject: () => {
      return Subjects.TestDeleted;
    },
  };

  /**
   * We can stress test by spamming deleted with wrong ID because the implementation does not
   * use transaction when detecting wrong id.
   */
  const promises = [];
  for (let i = 0; i < 20; i++) {
    const promise = await deleteListener.onMessage(deleteData, deleteMsg);
    promises.push(promise);
  }
  await Promise.all(promises);

  expect(deleteListener.infoIgnored).toHaveBeenCalledTimes(20);
  expect(deleteMsg.ack).toHaveBeenCalledTimes(20);
  expect(deleteListener.infoNotThisTime).toHaveBeenCalledTimes(0);
  expect(deleteListener.onTransaction).toHaveBeenCalledTimes(0);
  expect(logger.error).toHaveBeenCalledTimes(0);
});

class MyDeletedListenerThatThrows extends ReplicaUpdatedListener<MyDeletedEvent, TableReplica> {
  subject: Subjects.TestDeleted = Subjects.TestDeleted;
  queueGroupName: string = 'does not matter when testing, since we mock nats';

  onTransaction = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string }, row: TableReplica, transaction: Transaction) => {
    throw new Error('It must throw');
  });

  mapUpdateCols = jest.fn().mockImplementation((data: { id: number; versionKey: number; name: string; age: number }) => {
    throw new Error('It must throw');
  });

  infoIgnored? = jest.fn().mockImplementation((data: MyDeletedEvent['data'], row: any) => {
    throw new Error('It must throw');
  });
  infoNotThisTime? = jest.fn().mockImplementation((data: MyDeletedEvent['data'], row: any) => {
    throw new Error('It must throw');
  });
}

it('throws when we want it to do', async () => {
  await setupCreate(5);

  const deleteListener = new MyDeletedListenerThatThrows(
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
      return Subjects.TestDeleted;
    },
  };

  let didError;

  didError = false;
  try {
    await deleteListener.onMessage(
      {
        id: 666,
        versionKey: 666,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await deleteListener.onMessage(
      {
        id: 1,
        versionKey: 10,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await deleteListener.onMessage(
      {
        id: 1,
        versionKey: 4,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await deleteListener.onMessage(
      {
        id: 1,
        versionKey: 5,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

  didError = false;
  try {
    await deleteListener.onMessage(
      {
        id: 1,
        versionKey: 6,
      },
      updateMsg,
    );
  } catch (error) {
    didError = true;
  }
  expect(didError).toEqual(true);

});
