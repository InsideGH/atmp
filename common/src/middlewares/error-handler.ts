import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-error';
import { apiLogger } from '../logger/pino';

/**
 * Express error middleware. Should be placed at the very last middleware.
 *
 * Catches errors. If the error is of CustomError type, it knows that it can
 * call the serializeErrors method.
 *
 * Otherwise, we log the error and for __security reasons__, we respond with a
 * 'Something went wrong' message.
 *
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode;
  let errors;

  if (err instanceof CustomError) {
    errors = err.serializeErrors();
    statusCode = err.statusCode;
  } else {
    errors = [{ message: 'Something went wrong' }];
    statusCode = 400;
  }

  apiLogger.error(
    {
      statusCode,
      errors,
    },
    'Something went wrong',
  );

  res.status(statusCode).send({
    errors,
  });
};
