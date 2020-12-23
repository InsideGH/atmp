import { CustomError } from './custom-error';

/**
 * 404 status + message string serializer.
 */
export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message: string = 'Not found') {
    super(message);

    // Only because we are extending a build in class and to be able to do for example instance of
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ errorMsg: this.message }];
  }
}
