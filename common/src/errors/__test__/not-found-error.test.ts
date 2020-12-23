import { NotFoundError } from '../not-found-error';

it('serializes the error', () => {
  const error = new NotFoundError('Hello');
  expect(error.statusCode).toEqual(404);

  const serialized = error.serializeErrors();

  expect(serialized).toBeDefined();
  expect(serialized.length).toEqual(1);

  expect(serialized[0]).toEqual({
    errorMsg: 'Hello',
  });

  expect(error.message).toEqual('Hello');
  expect(error.stack).toBeDefined();
});
