import { PatientDeletedEvent } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { models } from '../../../sequelize/models';
import { PatientDeletedListener } from '../patient-deleted-listener';
import { Message } from 'node-nats-streaming';

const setup = async (config: { id: number; name: string }) => {
  /**
   * Create listener to test
   */
  const listener = new PatientDeletedListener(natsWrapper.client);

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
  const deletedEvent: PatientDeletedEvent['data'] = {
    id: config.id,
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
    deletedEvent,
    msg,
    originalPatient,
  };
};

it('deletes a patient', async () => {
  const { listener, deletedEvent, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(deletedEvent!.versionKey).toEqual(0);
  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(deletedEvent, msg);

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient).toBeNull();

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});

it('acks the message', async () => {
  const { listener, deletedEvent, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(deletedEvent!.versionKey).toEqual(0);
  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(deletedEvent, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not delete a patient if version number is wrong', async () => {
  const { listener, deletedEvent, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(deletedEvent!.versionKey).toEqual(0);
  expect(originalPatient!.name).toEqual('ponken');

  deletedEvent.versionKey = 10;

  try {
    await listener.onMessage(deletedEvent, msg);
  } catch (error) {}

  const stillPatient = await models.Patient.findByPk(originalPatient.id);
  expect(stillPatient!.name).toEqual('ponken');

  expect(msg.ack).not.toHaveBeenCalled();
});

it('ignore and acks the message if patient id is not found', async () => {
  const { listener, deletedEvent, msg, originalPatient } = await setup({
    id: 666,
    name: 'updated_ponken',
  });

  expect(deletedEvent!.versionKey).toEqual(0);
  expect(originalPatient!.name).toEqual('ponken');

  deletedEvent.id = 234;

  try {
    await listener.onMessage(deletedEvent, msg);
  } catch (error) {}

  const stillPatient = await models.Patient.findByPk(originalPatient.id);
  expect(stillPatient!.name).toEqual('ponken');

  expect(msg.ack).toHaveBeenCalled();
});
