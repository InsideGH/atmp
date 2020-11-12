import request from 'supertest';
import { app } from '../../app';

it('returns 400, if hwId is not provided in body', async () => {
  const hwId = undefined;

  const { body } = await request(app)
    .post('/')
    .set('Cookie', global.signin())
    .send({ hwId })
    .expect(400);

  expect(body.errors).toBeDefined();
  expect(body.errors.length).toEqual(1);
  expect(body.errors[0].message).toBeDefined;
});

it('returns 201, if hwId is provided in body', async () => {
  const hwId = 123;

  const { body } = await request(app)
    .post('/')
    .set('Cookie', global.signin())
    .send({ hwId })
    .expect(201);

  expect(body.alarm).toBeDefined();
  expect(body.alarm.hwId).toEqual(hwId);
  expect(body.event).toBeDefined();
});
