import db from '../sequelize/database';
import { initialize } from '../sequelize/initialize';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
      stripKeys: any;
    }
  }
}

jest.mock('../sequelize/database');
jest.mock('../sequelize/initialize');

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
 * Add on global functions that we need when testing...
 */
global.signin = () => {
  const base64 = '';
  return [`express:sess=${base64}`];
};

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
