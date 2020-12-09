import fetch from 'node-fetch';
import { stripKeys } from '@thelarsson/acss-common';

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
      stripKeys: any;
      fetch: any;
    }
  }
}

beforeAll(async () => {});

beforeEach(async () => {
  jest.clearAllMocks();
});

afterAll(async () => {});

/**
 * Add on global functions that we need when testing...
 */
global.signin = () => {
  const base64 = '';
  return [`express:sess=${base64}`];
};

global.stripKeys = stripKeys;

global.fetch = async (url: string, options: any) => {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } });
  const json = await res.json();
  return json;
};

export {};
