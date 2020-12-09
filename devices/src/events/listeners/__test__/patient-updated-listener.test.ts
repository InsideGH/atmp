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
    versionKey: 1,
  });

  /**
   * Create the event data to feed into listener.
   */
  const updateEventData: PatientUpdatedEvent['data'] = {
    id: config.id,
    name: config.name,
    versionKey: 2,
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

  expect(updateEventData!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(updateEventData, msg);

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient!.name).toEqual('updated_ponken');

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});

it('acks the message', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(updateEventData!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(updateEventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not updates a patient if version number is wrong', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(updateEventData!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  updateEventData.versionKey = 10;

  try {
    await listener.onMessage(updateEventData, msg);
  } catch (error) {}

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient!.name).toEqual('ponken');

  expect(msg.ack).not.toHaveBeenCalled();
});

it('ignore and acks the message if patient id is not found', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(updateEventData!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  updateEventData.id = 234;

  try {
    await listener.onMessage(updateEventData, msg);
  } catch (error) {}

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient!.name).toEqual('ponken');

  expect(msg.ack).toHaveBeenCalled();
});

it('handles events out of order', async () => {
  const { listener, updateEventData, msg, originalPatient } = await setup({
    id: 666,
    name: 'update1_ponken',
  });

  expect(updateEventData!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  /**
   * Try with version 3 first instead of version 2
   */
  updateEventData.versionKey = 3;
  try {
    await listener.onMessage(updateEventData, msg);
  } catch (error) {}

  const update2 = await models.Patient.findByPk(originalPatient.id);
  expect(update2!.name).toEqual('ponken');
  expect(update2!.versionKey).toEqual(1);
  expect(msg.ack).not.toHaveBeenCalled();

  /**
   * Try with version 2 now
   */
  updateEventData.versionKey = 2;
  try {
    await listener.onMessage(updateEventData, msg);
  } catch (error) {}

  const update1 = await models.Patient.findByPk(originalPatient.id);
  expect(update1!.name).toEqual('update1_ponken');
  expect(update1!.versionKey).toEqual(2);
  expect(msg.ack).toHaveBeenCalled();
});
