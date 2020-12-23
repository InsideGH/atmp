import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';

/**
 * 400 status + message array serializer (express-validators ValidationError).
 */
export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super('Invalid request parameters');

    // Only because we are extending a build in class and to be able to do for example instance of
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((error) => ({
      errorMsg: error.msg,
      field: error.param,
    }));
  }
}
