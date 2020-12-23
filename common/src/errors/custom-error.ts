/**
 * Extending built in NodeJS Error class.
 *
 * 'abstract', means you need to create implementations of it.
 *
 * You must implements the status code & the serializeErrors method.
 *
 */
export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract serializeErrors(): { errorMsg: string; field?: string }[];

  constructor(message: string) {
    super(message);

    // Only because we are extending a build in class and to be able to do for example instance of
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
