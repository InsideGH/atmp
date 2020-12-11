import { Stan } from 'node-nats-streaming';
import { Database } from './sqlite-memory-db';
import { initialize } from './initialize';
import { stripKeys } from '../util/strip-keys';
import { stanMock } from './stan-mock';

const sqliteMemoryDatabase = new Database();

declare global {
  namespace NodeJS {
    interface Global {
      stripKeys: any;
      db: Database;
      client: Stan;
    }
  }
}

beforeAll(async () => {
  await sqliteMemoryDatabase.connect();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await initialize(sqliteMemoryDatabase);
});

afterAll(async () => {
  await sqliteMemoryDatabase.disconnect();
});

global.stripKeys = stripKeys;

global.db = sqliteMemoryDatabase;

global.client = stanMock;

export {};
