import db from '../internal-events/sequelize/stuff/database';
import { initialize } from '../internal-events/sequelize/stuff/initialize';

declare global {
  namespace NodeJS {
    interface Global {
      stripKeys: any;
    }
  }
}

jest.mock('../nats/nats-wrapper');

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

export {};
