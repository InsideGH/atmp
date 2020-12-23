import { RequestValidationError } from '../request-validation-error';

it('serializes the error', () => {
  const error = new RequestValidationError([
    {
      msg: 'Name is required',
      location: 'body',
      value: 'Peter',
      param: 'name',
    },
    {
      msg: 'Age is required',
      location: 'body',
      value: 10,
      param: 'age',
    },
  ]);

  expect(error.statusCode).toEqual(400);

  const serialized = error.serializeErrors();

  expect(serialized).toBeDefined();
  expect(serialized.length).toEqual(2);

  expect(serialized[0]).toEqual({
    errorMsg: 'Name is required',
    field: 'name',
  });

  expect(serialized[1]).toEqual({
    errorMsg: 'Age is required',
    field: 'age',
  });

  expect(error.stack).toBeDefined();
});
