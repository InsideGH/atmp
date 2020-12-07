import { Services } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';

it('returns 200, when fetching services', async () => {
  const { body } = await request(app).get('/services').send().expect(200);
  expect(body).toEqual(Object.values(Services).sort());
});
