import { PatientDeletedEvent } from '@thelarsson/acss-common';
import { natsWrapper } from '../../../nats-wrapper';
import { models } from '../../../sequelize/models';
import { PatientDeletedListener } from '../patient-deleted-listener';
import { Message } from 'node-nats-streaming';

const setup = async (config: { id: number }) => {
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
    versionKey: 1,
  });

  /**
   * Create the event data to feed into listener.
   */
  const deletedEvent: PatientDeletedEvent['data'] = {
    id: config.id,
    versionKey: 2,
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
  });

  expect(deletedEvent!.versionKey).toEqual(2);
  expect(originalPatient!.name).toEqual('ponken');

  await listener.onMessage(deletedEvent, msg);

  const updatedPatient = await models.Patient.findByPk(originalPatient.id);
  expect(updatedPatient).toBeNull();

  const records = await models.Record.findAll({});
  expect(records.length).toEqual(1);
});
