import request from 'supertest';
import { app } from '../../app';

it('returns 200, and stepped version number', async () => {
  const hwId = 123;

  const res = await request(app)
    .post('/')
    .set('Cookie', global.signin())
    .send({ hwId })
    .expect(201);

  expect(res.body.alarm.versionKey).toEqual(0);

  const { body } = await request(app)
    .put('/')
    .set('Cookie', global.signin())
    .send({ hwId, state: 'cool' })
    .expect(200);

  expect(body.alarm).toBeDefined();
  expect(body.alarm.hwId).toEqual(String(hwId));
  expect(body.alarm.versionKey).toEqual(1);
});
