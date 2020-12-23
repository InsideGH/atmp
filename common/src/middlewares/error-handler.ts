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
    const msg = err.toString();
    const errors = err.serializeErrors();
    const statusCode = err.statusCode;

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
  } else {
    const msg = 'Something went wrong';

    apiLogger.error(err, msg);

    const errors = [{ message: msg }];
    const statusCode = 400;

    res.status(statusCode).send({
      errors,
    });
  }
};
