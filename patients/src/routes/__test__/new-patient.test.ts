import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 200, correct body', async () => {
  const payload = {
    firstName: 'cool',
  };

  const { body } = await request(app)
    .post('/')
    .set('Cookie', global.signin())
    .send(payload)
    .expect(201);

  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt']);

  expect(body.patient).toEqual({
    id: 1,
    name: 'cool',
    versionKey: 0,
  });

  const events = await models.Event.findAll({});

  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);

  expect(events.length).toEqual(1);
  expect(events[0].dataValues).toEqual({
    id: 1,
    subject: Subjects.PatientCreated,
    sent: false,
    data: {
      id: 1,
      name: 'cool',
      versionKey: 0,
    },
  });
});
