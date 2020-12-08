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
    versionKey: 0,
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
  expect(patient!.versionKey).toEqual(0);

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup({ id: 666, name: 'kulan' });

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('creates a patient multiple times will be ignore', async () => {
  const { listener, data, msg } = await setup({ id: 666, name: 'kulan' });
  await listener.onMessage(data, msg);
  await listener.onMessage(data, msg);

  const patient = await models.Patient.findByPk(data.id);

  expect(patient).toBeDefined();
  expect(patient!.id).toEqual(666);
  expect(patient!.name).toEqual('kulan');
  expect(patient!.versionKey).toEqual(0);
});

it('creates many patients', async () => {
  const { listener, data, msg } = await setup({ id: 666, name: 'kulan' });

  const promises = [];

  for (let i = 0; i < 1; i++) {
    promises.push(
      new Promise<any>(async (resolve, reject) => {
        data.id = i;
        try {
          await listener.onMessage(
            {
              ...data,
              id: i,
              versionKey: i,
            },
            msg,
          );
          const patient = await models.Patient.findByPk(i);
          expect(patient).toBeDefined();
          expect(patient!.id).toEqual(i);
          expect(patient!.name).toEqual('kulan');
          expect(patient!.versionKey).toEqual(i);
          resolve(patient);
        } catch (error) {
          reject(error);
        }
      }),
    );
  }
  await Promise.all(promises);
});
