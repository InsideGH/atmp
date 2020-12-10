import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing offset', async () => {
  const { body } = await request(app).post('/events').send({ limit: 10 }).expect(400);
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
  const { body } = await request(app).post('/events').send({ offset: 0 }).expect(400);
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
  const { body } = await request(app).post('/events').send({}).expect(400);
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
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app).post('/events').send({ offset: 0, limit: 10 }).expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 4,
    rows: inputData.map((d, i) => ({
      id: i + 1,
      data: d.data,
      sequence: d.sequence,
      subject: d.subject,
    })),
  });
});

it('returns 200, when fetching with limit', async () => {
  const inputData = [
    {
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app).post('/events').send({ offset: 0, limit: 1 }).expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 4,
    rows: [
      {
        id: 1,
        subject: 'patient:created',
        data: { id: 1, name: 'kalle' },
        sequence: 0,
      },
    ],
  });
});

it('returns 200, when fetching with offset/limit', async () => {
  const inputData = [
    {
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app).post('/events').send({ offset: 1, limit: 1 }).expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 4,
    rows: [
      {
        id: 2,
        subject: 'patient:updated',
        data: { id: 1, name: 'kalleUpdated1' },
        sequence: 1,
      },
    ],
  });
});

it('returns 200, when fetching with sorter', async () => {
  const inputData = [
    {
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app)
    .post('/events')
    .send({
      offset: 0,
      limit: 10,
      sorter: [
        {
          field: 'id',
          order: 'decending',
        },
      ],
    })
    .expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 4,
    rows: inputData
      .map((d, i) => ({
        id: i + 1,
        data: d.data,
        sequence: d.sequence,
        subject: d.subject,
      }))
      .reverse(),
  });
});

it('returns 200, when fetching with sorter & filter', async () => {
  const inputData = [
    {
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app)
    .post('/events')
    .send({
      offset: 0,
      limit: 10,
      sorter: [
        {
          field: 'id',
          order: 'decending',
        },
      ],
      filters: {
        subject: ['patient:created'],
      },
    })
    .expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 2,
    rows: [
      {
        id: 4,
        subject: 'patient:created',
        data: { id: 2, name: 'nisse' },
        sequence: 0,
      },
      {
        id: 1,
        subject: 'patient:created',
        data: { id: 1, name: 'kalle' },
        sequence: 0,
      },
    ],
  });
});

it('returns 200, when fetching with sorter & filter & excluded filter', async () => {
  const inputData = [
    {
      subject: 'patient:created',
      data: { id: 1, name: 'kalle' },
      sequence: 0,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated1' },
      sequence: 1,
      timestamp: new Date(),
    },
    {
      subject: 'patient:updated',
      data: { id: 1, name: 'kalleUpdated2' },
      sequence: 2,
      timestamp: new Date(),
    },
    {
      subject: 'patient:created',
      data: { id: 2, name: 'nisse' },
      sequence: 0,
      timestamp: new Date(),
    },
  ];
  for (const entry of inputData) {
    await models.Event.create(entry);
  }
  const { body } = await request(app)
    .post('/events')
    .send({
      offset: 0,
      limit: 10,
      sorter: [
        {
          field: 'id',
          order: 'decending',
        },
      ],
      filters: {
        subject: ['patient:created', 'patiend:updated'],
      },
      excludedFilters: {
        subject: ['patiend:updated'],
      },
    })
    .expect(200);
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'timestamp']);

  expect(body).toEqual({
    count: 2,
    rows: [
      {
        id: 4,
        subject: 'patient:created',
        data: { id: 2, name: 'nisse' },
        sequence: 0,
      },
      {
        id: 1,
        subject: 'patient:created',
        data: { id: 1, name: 'kalle' },
        sequence: 0,
      },
    ],
  });
});
