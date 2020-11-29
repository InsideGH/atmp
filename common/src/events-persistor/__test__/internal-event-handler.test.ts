import { internalEventHandler } from '../internal-event-handler';

it('sends and receives event', async () => {
  const waitForEvent = new Promise<void>((resolve) => {
    internalEventHandler.listen((id) => {
      expect(id).toEqual(666);
      resolve();
    });
  });

  internalEventHandler.publish(666);

  await waitForEvent;

  internalEventHandler.closeAll();
});
