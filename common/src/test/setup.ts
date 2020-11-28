import { Stan } from 'node-nats-streaming';
import db, { Database } from './database';
import { initialize } from './initialize';

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
  await db.connect();
});

beforeEach(async () => {
  jest.clearAllMocks();
  await initialize(db);
});

afterAll(async () => {
  await db.disconnect();
});

/**
 * Remove keys from object.
 */
global.stripKeys = (obj: any, keys: string[]) => {
  if (Array.isArray(obj)) {
    obj.forEach((x) => global.stripKeys(x, keys));
  } else if (typeof obj == 'object') {
    for (const key in obj) {
      const value = obj[key];
      if (keys.includes(key)) {
        delete obj[key];
      } else {
        global.stripKeys(value, keys);
      }
    }
  }
};

global.db = db;

global.client = <any>{
  publish: jest.fn().mockImplementation((subject: string, data: string, callback: () => void) => {
    callback();
  }),
};

export {};
