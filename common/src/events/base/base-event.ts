import { Subjects } from '../subjects';

/**
 * The event structure.
 *
 * The subject is enum. The data can be anything.
 */
export interface BaseEvent {
  subject: Subjects;
  data: any;
}
