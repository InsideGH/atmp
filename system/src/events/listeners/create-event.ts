import { models } from '../../sequelize/models';
import { Message } from 'node-nats-streaming';
import { BaseEvent } from '@thelarsson/acss-common';

export const createEvent = async <T extends BaseEvent>(data: T['data'], msg: Message) => {
  await models.Event.create({
    subject: msg.getSubject(),
    sequence: msg.getSequence(),
    timestamp: msg.getTimestamp(),
    data,
  });
};
