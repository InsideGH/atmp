import db from '../sequelize/database';
import { initialize } from '../sequelize/initialize';
import { stripKeys } from '@thelarsson/acss-common';

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
jest.mock('../nats-wrapper');

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
global.stripKeys = stripKeys;

export {};
