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
  let msg;

  if (err instanceof CustomError) {
    msg = err.toString();
    errors = err.serializeErrors();
    statusCode = err.statusCode;
  } else {
    msg = 'Something went wrong';
    errors = [{ message: msg }];
    statusCode = 400;
  }

  apiLogger.error(
    {
      statusCode,
      errors,
    },
    msg,
  );

  res.status(statusCode).send({
    errors,
  });
};
