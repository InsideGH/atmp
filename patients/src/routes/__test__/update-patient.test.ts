import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing patient id', async () => {
  /**
   * Update a patient.
   */
  const { body } = await request(app)
    .put('/')
    .send({
      firstName: 'snoop',
    })
    .expect(400);

  expect(body.errors[0]).toEqual({ message: 'patiend id is required', field: 'id' });
});

it('returns 400, when updating a non existing patient', async () => {
  /**
   * Update a patient.
   */
  const { body } = await request(app)
    .put('/')
    .send({
      firstName: 'snoop',
      id: 1,
    })
    .expect(400);

  expect(body.errors[0]).toEqual({ message: 'Patient with id=1 not found' });
});

it('returns 200, when updating a patient', async () => {
  /**
   * Create patient.
   */
  await request(app).post('/').send({
    firstName: 'cool',
  });

  /**
   * Update a patient.
   */
  const { body } = await request(app)
    .put('/')
    .send({
      firstName: 'snoop',
      id: 1,
    })
    .expect(200);

  /**
   * Verify response.
   */
  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt']);
  expect(body.patient).toEqual({
    id: 1,
    name: 'snoop',
    versionKey: 2,
  });

  /**
   * Verify patient versionKey and name in DB
   */
  const patient = await models.Patient.findByPk(body.patient.id);
  expect(patient!.id).toEqual(1);
  expect(patient!.name).toEqual('snoop');
  expect(patient!.versionKey).toEqual(2);

  /**
   * Verify event versionKey in DB.
   */
  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt', 'age']);
  expect(events.length).toEqual(2);
  expect(events[1].dataValues).toEqual({
    id: 2,
    subject: Subjects.PatientUpdated,
    sent: false,
    data: {
      id: 1,
      name: 'snoop',
      versionKey: 2,
    },
  });

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(2);
});
