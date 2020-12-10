import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 200, when assign device correctly', async () => {
  /**
   * Make the request to create a device.
   */
  const deviceRes = await request(app)
    .post('/')
    .send({
      type: 'klocka',
    })
    .expect(201);

  /**
   * Create the patient
   */
  await models.Patient.create({
    id: 1,
    name: 'gunnar',
    versionKey: 1,
  });

  /**
   * Assign device to patient.
   */
  const { body } = await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(200);

  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'age']);

  expect(body.patient).toEqual({
    id: 1,
    name: 'gunnar',
    versionKey: 1,
  });

  expect(body.device).toEqual({
    id: 1,
    type: 'klocka',
    versionKey: 2,
    PatientId: 1,
  });

  /**
   * Verify event in DB
   */
  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);
  expect(events.length).toEqual(2);
  expect(events[0].dataValues).toEqual({
    id: 1,
    subject: Subjects.DeviceCreated,
    sent: false,
    data: {
      id: 1,
      type: 'klocka',
      versionKey: 1,
    },
  });
  expect(events[1].dataValues).toEqual({
    id: 2,
    subject: Subjects.DeviceUpdated,
    sent: false,
    data: {
      id: 1,
      type: 'klocka',
      versionKey: 2,
      patientId: 1,
    },
  });
});

it('returns 400, when assign same multiple times', async () => {
  /**
   * Make the request to create a device.
   */
  const deviceRes = await request(app)
    .post('/')
    .send({
      type: 'klocka',
    })
    .expect(201);

  /**
   * Create the patient
   */
  await models.Patient.create({
    id: 1,
    name: 'gunnar',
    versionKey: 1,
  });

  /**
   * Assign device to patient.
   */
  await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(200);

  /**
   * Assign device to patient.
   */
  const { body } = await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('already assigned');
});

it('returns 400, when non existing deviceId', async () => {
  /**
   * Make the request to create a device.
   */
  const deviceRes = await request(app)
    .post('/')
    .send({
      type: 'klocka',
    })
    .expect(201);

  /**
   * Create the patient
   */
  await models.Patient.create({
    id: 1,
    name: 'gunnar',
    versionKey: 1,
  });

  /**
   * Assign device to patient.
   */
  const { body } = await request(app)
    .post('/assign')
    .send({
      deviceId: 1111,
      patientId: 1,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('device 1111 not found');
});

it('returns 400, when non existing patientId', async () => {
  /**
   * Make the request to create a device.
   */
  const deviceRes = await request(app)
    .post('/')
    .send({
      type: 'klocka',
    })
    .expect(201);

  /**
   * Create the patient
   */
  await models.Patient.create({
    id: 1,
    name: 'gunnar',
    versionKey: 1,
  });

  /**
   * Assign device to patient.
   */
  const { body } = await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1111,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('patient 1111 not found');
});
