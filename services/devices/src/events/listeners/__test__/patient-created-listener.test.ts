import { PatientCreatedEvent } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { models } from '../../../sequelize/models';
import { PatientCreatedListener } from '../patient-created-listener';
import { Message } from 'node-nats-streaming';

const setup = async (config: { id: number; name: string }) => {
  /**
   * Create listener to test
   */
  const listener = new PatientCreatedListener(natsWrapper.client);

  /**
   * Create the event data to feed into listener.
   */
  const data: PatientCreatedEvent['data'] = {
    id: config.id,
    name: config.name,
    versionKey: 1,
  };

  /**
   * Create a msg (with the ack method)
   */
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
    getSequence: () => {
      return 0;
    },
  };

  return {
    listener,
    data,
    msg,
  };
};

it('creates a patient', async () => {
  const { listener, data, msg } = await setup({ id: 666, name: 'kulan' });

  await listener.onMessage(data, msg);

  const patient = await models.Patient.findByPk(data.id);

  expect(patient).toBeDefined();
  expect(patient!.id).toEqual(666);
  expect(patient!.name).toEqual('kulan');
  expect(patient!.versionKey).toEqual(1);

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});
