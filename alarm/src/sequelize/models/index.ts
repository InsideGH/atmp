import Alarm, { AlarmInterface } from './alarm';
import Event, { EventInterface } from './event';

export interface Models {
  Alarm: AlarmInterface;
  Event: EventInterface;
}

export const models = {
  Alarm,
  Event,
};
