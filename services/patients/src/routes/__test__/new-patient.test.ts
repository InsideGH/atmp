import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing required firstName', async () => {
  const { body } = await request(app).post('/').send({}).expect(400);
  expect(body.errors[0]).toEqual({ message: 'patient firstName is required', field: 'firstName' });
});

it('returns 201, when creating a patient', async () => {
  /**
   * Make the request to create a patient.
   */
  const { body } = await request(app)
    .post('/')
    .send({
      firstName: 'cool',
    })
    .expect(201);

  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt']);

  /**
   * Verify response.
   */
  expect(body.patient).toEqual({
    id: 1,
    name: 'cool',
    versionKey: 1,
  });

  /**
   * Verify patient in DB
   */
  const patient = await models.Patient.findByPk(body.patient.id);
  expect(patient).toBeDefined();

  /**
   * Verify event in DB
   */
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
      versionKey: 1,
    },
  });

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});
