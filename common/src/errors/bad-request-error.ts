import { CustomError } from './custom-error';

/**
 * ----------->
 * This looks very OO but can't do much about it since we are extending a build in class (CustomError -> Error)
 * <-----------
 */
export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
