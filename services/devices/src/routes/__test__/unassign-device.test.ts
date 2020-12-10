import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

const createDevicePatient = async () => {
  /**
   * Make the request to create a device (v1)
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
};

it('returns 200, when unassign device correctly', async () => {
  await createDevicePatient();

  /**
   * Assign device (v2) to patient
   */
  await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(200);

  /**
   * Unassign device (v3) from patient.
   */
  const { body } = await request(app)
    .post('/unassign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(200);

  global.stripKeys(body, ['createdAt', 'updatedAt', 'deletedAt', 'age']);

  expect(body).toEqual({
    device: {
      id: 1,
      type: 'klocka',
      versionKey: 3,
      PatientId: null,
    },
  });

  /**
   * Verify event in DB
   */
  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt']);
  expect(events.length).toEqual(3);
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
  expect(events[2].dataValues).toEqual({
    id: 3,
    subject: Subjects.DeviceUpdated,
    sent: false,
    data: {
      id: 1,
      type: 'klocka',
      versionKey: 3,
    },
  });
});

it('returns 400, when unassign non existing device', async () => {
  await createDevicePatient();

  /**
   * Unassign non-exist device from patient.
   */
  const { body } = await request(app)
    .post('/unassign')
    .send({
      deviceId: 1111,
      patientId: 1,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('device 1111 not found');
});

it('returns 400, when unassign non existing patient', async () => {
  await createDevicePatient();

  /**
   * Unassign non-exist device from patient.
   */
  const { body } = await request(app)
    .post('/unassign')
    .send({
      deviceId: 1,
      patientId: 11111,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('patient 11111 not found');
});

it('returns 400, when unassign multiple times from patient', async () => {
  await createDevicePatient();

  /**
   * Unassign non-exist device from patient.
   */
  await request(app)
    .post('/unassign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(400);

  const { body } = await request(app)
    .post('/unassign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('not assigned to');
});

it('returns 400, when unassign someone elses device', async () => {
  await createDevicePatient();

  /**
   * Make the request to create a device (v1)
   */
  const chainDevice = await request(app)
    .post('/')
    .send({
      type: 'chain',
    })
    .expect(201);

  /**
   * Create the patient
   */
  const hulken = await models.Patient.create({
    id: 2,
    name: 'hulken',
    versionKey: 1,
  });

  /**
   * Assign klocka to gunnar
   */
  await request(app)
    .post('/assign')
    .send({
      deviceId: 1,
      patientId: 1,
    })
    .expect(200);

  /**
   * Assign chain to hulken
   */
  await request(app)
    .post('/assign')
    .send({
      deviceId: 2,
      patientId: 2,
    })
    .expect(200);

  const { body } = await request(app)
    .post('/unassign')
    .send({
      deviceId: 1,
      patientId: 2,
    })
    .expect(400);

  expect(body.errors[0].message).toContain('device 1 not assigned to patient 2');
});
