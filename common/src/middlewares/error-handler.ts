import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-error';
import { logger } from '../logger/pino';

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
    logger.error(err.serializeErrors());
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  logger.error(err);

  res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
