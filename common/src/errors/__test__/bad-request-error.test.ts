import { BadRequestError } from '../bad-request-error';

it('serializes the error', () => {
  const error = new BadRequestError('Hello');

  expect(error.statusCode).toEqual(400);

  const serialized = error.serializeErrors();

  expect(serialized).toBeDefined();
  expect(serialized.length).toEqual(1);

  expect(serialized[0]).toEqual({
    message: 'Hello',
  });

  expect(error.message).toEqual('Hello');
  expect(error.stack).toBeDefined();
});
