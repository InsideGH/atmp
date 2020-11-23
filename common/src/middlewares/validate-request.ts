import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-error';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  /**
   * Input validation.
   */
  console.log('AAA', req.body);
  const errors = validationResult(req);
  console.log('BBB', errors);
  console.log('CCC', errors.isEmpty());

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
  next();
};
