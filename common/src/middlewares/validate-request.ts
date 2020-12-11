import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

/**
 * Should be used within the API routes handlers as an middleware to catch any
 * of the 'express-validator' errors.
 *
 * When catching, it creates a 'RequestValidationError' which conforms to the
 * general error structure defined in 'CustomError'.
 *
 * (Thus, the error handler will catch it and serialize the array)
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  /**
   * Input validation.
   */
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
  next();
};
