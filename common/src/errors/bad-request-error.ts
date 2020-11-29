import { CustomError } from './custom-error';

/**
 * Extending built in Error through CustomError.
 */
export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a build in class and to be able to do for example instance of
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
