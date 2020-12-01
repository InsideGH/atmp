import { Subjects } from '@thelarsson/acss-common';
import request from 'supertest';
import { app } from '../../app';
import { models } from '../../sequelize/models';

it('returns 200, when fetching all events', async () => {
  const { body } = await request(app).post('/').send({}).expect(200);
});
