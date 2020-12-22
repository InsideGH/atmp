import db from '../sequelize/database';
import { initialize } from '../sequelize/initialize';
import { stripKeys } from '@thelarsson/acss-common';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
      stripKeys: any;
      SocketWrapper: jest.Mock<any, any>;
    }
  }
}

jest.mock('@thelarsson/acss-common/build/logger/pino');
jest.mock('../sequelize/database');
jest.mock('../sequelize/initialize');
jest.mock('../nats-wrapper');
jest.mock('../socket/socket-wrapper');

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

global.stripKeys = stripKeys;

global.SocketWrapper = jest.fn().mockImplementation(function () {
  return {
    start: () => {},
    close: () => {},
    broadcast: jest.fn(),
  };
});

export {};
