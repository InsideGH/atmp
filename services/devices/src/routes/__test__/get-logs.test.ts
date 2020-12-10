import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing offset', async () => {
  const { body } = await request(app).post('/logs').send({ limit: 10 }).expect(400);
  expect(body).toEqual({
    errors: [
      {
        field: 'offset',
        message: 'offset is required',
      },
    ],
  });
});

it('returns 400, when not providing limit', async () => {
  const { body } = await request(app).post('/logs').send({ offset: 0 }).expect(400);
  expect(body).toEqual({
    errors: [
      {
        field: 'limit',
        message: 'limit is required',
      },
    ],
  });
});

it('returns 400, when not providing limit/offset', async () => {
  const { body } = await request(app).post('/logs').send({}).expect(400);
  expect(body).toEqual({
    errors: [
      {
        field: 'offset',
        message: 'offset is required',
      },
      {
        field: 'limit',
        message: 'limit is required',
      },
    ],
  });
});

it('returns 200, when fetching something', async () => {
  const inputData = [
    {
      msg: 'aaa',
      data: { id: 1, name: 'kalle' },
    },
    {
      msg: 'bbb',
      data: { id: 1, name: 'nisse' },
    },
  ];
  for (const entry of inputData) {
    await models.Record.create(entry);
  }
  const { body } = await request(app).post('/logs').send({ offset: 0, limit: 10 }).expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 2,
    rows: inputData.map((d, i) => ({
      id: i + 1,
      data: d.data,
      msg: d.msg,
    })),
  });
});
