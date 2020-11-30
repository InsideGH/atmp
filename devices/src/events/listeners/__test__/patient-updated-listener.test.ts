import { PatientUpdatedEvent } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { models } from '../../../sequelize/models';
import { PatientUpdatedListener } from '../patient-updated-listener';
import { Message } from 'node-nats-streaming';

const setup = async (config: { id: number; name: string }) => {
  /**
   * Create listener to test
   */
  const listener = new PatientUpdatedListener(natsWrapper.client);

  /**
   * Create a patient in the database
   */
  const originalPatient = await models.Patient.create({
    id: 666,
    name: 'ponken',
    versionKey: 0,
  });

  /**
   * Create the event data to feed into listener.
   */
  const updateEventData: PatientUpdatedEvent['data'] = {
    id: config.id,
    name: config.name,
    versionKey: 1,
    age: 1,
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
    updateEventData,
    msg,
    originalPatient,
  };
};

it('updates a patient', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(updateEventData, msg);

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient!.name).toEqual('updated_ponken');
});

it('acks the message', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  await listener.onMessage(updateEventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not updates a patient if version number is wrong', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(updateEventData!.versionKey).toEqual(1);
  expect(originalPatient!.name).toEqual('ponken');

  updateEventData.versionKey = 10;

  try {
    await listener.onMessage(updateEventData, msg);
  } catch (error) {}

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient!.name).toEqual('ponken');

  expect(msg.ack).not.toHaveBeenCalled();
});
