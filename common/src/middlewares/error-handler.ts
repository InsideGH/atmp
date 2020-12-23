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
  if (err instanceof CustomError) {
    apiLogger.error(err.serializeErrors());
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  apiLogger.error(err);

  res.status(400).send({
    errors: [{ errorMsg: 'Something went wrong' }],
  });
};
