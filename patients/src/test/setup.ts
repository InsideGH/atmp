import db from '../sequelize/database';
import { initialize } from '../sequelize/initialize';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
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

export {};
