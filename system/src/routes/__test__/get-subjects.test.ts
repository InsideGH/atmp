import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';

it('returns 200, when fetching subjects', async () => {
  const { body } = await request(app).get('/subjects').send().expect(200);
  expect(body).toEqual(Object.values(Subjects).sort());
});
