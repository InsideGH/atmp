import request from 'supertest';
import { app } from '../../app';

it('returns 200, when fetching all events', async () => {
  const { body } = await request(app).post('/events').send({ offset: 0, limit: 0 }).expect(200);
});

it('returns 200, when fetching subjects', async () => {
  const { body } = await request(app).get('/subjects').send().expect(200);
});
