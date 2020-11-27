import { models } from '../../sequelize/models';
import { NatsPublisher } from './nats-publisher';

export const cronNatsJob = async (natsPublisher: NatsPublisher): Promise<number> => {
  const events = (
    await models.Event.findAll({
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
