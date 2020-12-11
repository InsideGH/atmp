/**
 * Event without restriction on subject (no enum).
 *
 * Reason for allowing this is that we make sure that when we STORE the events into the database,
 * we typecheck. Therefor, when reading out from the database, we do not need to type check
 * again.
 *
 * Another reason for not having the subject locked down is the hassle that it would give us.
 *
 * Imagine that we would have subject locked down. We read the event from the database. We get
 * <any> from the database read and would need to unsafe typecast it to the event structure.
 *
 * OR
 *
 * To make typescript happy from a type safety perspective, we would need to create our typed events.
 * And to do this, we would need to at runtime check every data field + some more hassle...
 *
 * So, we make sure that what we put INTO the database is typechecked, thats it.
 */
export interface AnyEvent {
  subject: string;
  data: any;
}
