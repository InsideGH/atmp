import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 400, when not providing patient id', async () => {
  const { body } = await request(app).del('/').send({}).expect(400);
  expect(body.errors[0]).toEqual({ message: 'patiend id is required', field: 'id' });
});

it('returns 400, when delete a non existing patient', async () => {
  const { body } = await request(app)
    .delete('/')
    .send({
      id: 1,
    })
    .expect(400);

  expect(body.errors[0]).toEqual({ message: '[ REQ ] Patient 1 delete FAIL - not found' });
});

it('returns 200, when deleting a patient', async () => {
  /**
   * Create patient.
   */
  const createResponse = await request(app).post('/').send({
    firstName: 'cool',
  });

  /**
   * Delete patient.
   */
  const deleteResponse = await request(app)
    .del('/')
    .send({
      id: 1,
    })
    .expect(200);

  /**
   * Verify response.
   */
  expect(deleteResponse.body).toEqual({
    deleted: true,
  });

  /**
   * Verify patient in DB
   */
  const patient = await models.Patient.findByPk(createResponse.body.patient.id);
  expect(patient).toBeNull();

  /**
   * Verify event versionKey in DB. Since we created (v1), deleted (v2), the version key is
   * 2.
   */
  const events = await models.Event.findAll({});
  global.stripKeys(events, ['createdAt', 'updatedAt', 'deletedAt', 'age']);
  expect(events.length).toEqual(2);
  expect(events[1].dataValues).toEqual({
    id: 2,
    subject: Subjects.PatientDeleted,
    sent: false,
    data: {
      id: 1,
      versionKey: 2,
    },
  });

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(2);
});
