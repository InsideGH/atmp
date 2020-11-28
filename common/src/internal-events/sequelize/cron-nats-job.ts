import { Event } from './models/event';
import { NatsPublisher } from './nats-publisher';

/**
 * Search in DB for events that needs to be sent and sends them to nats using the provided publishers sendEvent method.
 */
export const cronNatsJob = async (natsPublisher: NatsPublisher): Promise<number> => {
  const events = (
    await Event.findAll({
      where: {
        sent: false,
      },
    })
  ).map((e) => e.id);

  for (let i = 0; i < events.length; i++) {
    const id = events[i];
    await natsPublisher.sendEvent(id);
  }

  return events.length;
};
