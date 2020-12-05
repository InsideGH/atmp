import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing required type', async () => {
  const { body } = await request(app).post('/').send({}).expect(400);
  expect(body.errors[0]).toEqual({ message: 'device type is required', field: 'type' });
});

it('returns 201, when creating a device', async () => {
  /**
   * Make the request to create a device.
   */
  const { body } = await request(app)
    .post('/')
    .send({
      type: 'watch',
    })
    .expect(201);

  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt']);

  /**
   * Verify response.
   */
  expect(body.device).toEqual({
    id: 1,
    type: 'watch',
    versionKey: 0,
    PatientId: null
  });

  /**
   * Verify device in DB
   */
  const device = await models.Device.findByPk(body.device.id);
  expect(device).toBeDefined();

  /**
   * Verify event in DB
   */
  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);
  expect(events.length).toEqual(1);
  expect(events[0].dataValues).toEqual({
    id: 1,
    subject: Subjects.DeviceCreated,
    sent: false,
    data: {
      id: 1,
      type: 'watch',
      versionKey: 0,
    },
  });
});
