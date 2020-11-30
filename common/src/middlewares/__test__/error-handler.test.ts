import request from 'supertest';
import { app } from '../../test/app';

it('error handler triggered when requesting non-existing url', async () => {
  const response = await request(app).get('/non-existing-route').expect(404);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.length).toEqual(1);
  expect(response.body.errors[0]).toEqual({
    message: 'Not found',
  });
});

it('error handler does not trigger when requesting existing url with valid parameter', async () => {
  const response = await request(app).post('/test').send({ code: 'value required' }).expect(200);
  expect(response.body.errors).not.toBeDefined();
});

it('error handler triggered when throwing custom error inside existing route', async () => {
  const response = await request(app)
    .post('/test')
    .send({
      code: 'throw-bad-request-error',
    })
    .expect(400);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.length).toEqual(1);
  expect(response.body.errors[0]).toEqual({
    message: 'My bad request message',
  });
});

it('error handler triggered when throwing build in error inside existing route', async () => {
  const response = await request(app)
    .post('/test')
    .send({
      code: 'throw-error',
    })
    .expect(400);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.length).toEqual(1);
  expect(response.body.errors[0]).toEqual({
    message: 'Something went wrong',
  });
});

it('error handler triggered when passing in faulty parameter', async () => {
  const response = await request(app).post('/test').send({}).expect(400);

  expect(response.body.errors).toBeDefined();
  expect(response.body.errors.length).toEqual(1);
  expect(response.body.errors[0]).toEqual({
    field: 'code',
    message: 'code is required',
  });
});
