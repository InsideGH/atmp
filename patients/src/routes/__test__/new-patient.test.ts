import request from 'supertest';
import { app } from '../../app';

it('returns 200, correct body', async () => {
  const payload = {
    firstName: 'Peter',
  };

  const { body } = await request(app)
    .post('/patient')
    .set('Cookie', global.signin())
    .send(payload)
    .expect(201);

  console.log(body);
});
