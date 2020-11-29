/**
 * Event without restriction on subject (no enum).
 *
 * Reason for this is that we make sure that when we place events into the event database,
 * we typecheck. Therefor, when reading out from the database, we do not need to type check
 * again.
 *
 * Another reason is that we would then need to at runtime check the subject AND all the fields
 * in the data as well. Which would be just to cumbersome and hard to get right and heavy to maintain.
 */
export interface AnyEvent {
  subject: string;
  data: any;
}
