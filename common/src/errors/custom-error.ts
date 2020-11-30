/**
 * Extending built in Error.
 */
export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract serializeErrors(): { message: string; field?: string }[];

  constructor(message: string) {
    super(message);
    
    // Only because we are extending a build in class and to be able to do for example instance of
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
