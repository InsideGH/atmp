import { BaseEvent, Listener, Subjects } from '@thelarsson/acss-common';
import { models } from '../../../sequelize/models';

export const verifyEntry = async <T extends BaseEvent>(
  subject: Subjects,
  listener: Listener<T>,
  data: T['data'],
) => {
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: () => 0,
    getSubject: () => subject,
  };

  await listener.onMessage(data, msg);

  const event = await models.Event.findByPk(1);

  expect(event).toBeDefined();
  expect(event!.data).toEqual(data);
  expect(event!.subject).toEqual(subject);
  expect(msg.ack).toHaveBeenCalled();
};
