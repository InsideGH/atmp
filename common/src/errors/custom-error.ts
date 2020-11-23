/**
 * Implement this if you want to make your own error returned from any service
 * to the frontend.
 *
 * ----------->
 * This looks very OO but can't do much about it since we are extending a build in class (Error)
 * <-----------
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
