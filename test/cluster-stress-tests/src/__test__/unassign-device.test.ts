import faker from 'faker';

it('should update device 1 time during simultanious unassign requests', async () => {
  const NBR_OF_UPDATED = 20;
  /**
   * Create ONE patient
   */
  const { patient } = await global.fetch('http://admin.acss.dev/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: faker.name.findName(),
    }),
  });
  expect(patient.versionKey).toEqual(1);

  /**
   * Create ONE device
   */
  const { device } = await global.fetch('http://admin.acss.dev/api/devices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: faker.commerce.product(),
    }),
  });
  expect(device.versionKey).toEqual(1);

  /**
   * We can't be sure that the device service actually knows about the patient, depends
   * on if the event has reached it or not yet.
   */
  const { device: assignedDevice } = await global.fetch(
    'http://admin.acss.dev/api/devices/assign',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: device.id,
        patientId: patient.id,
      }),
    },
  );

  if (assignedDevice) {
    expect(assignedDevice.versionKey).toEqual(2);

    /**
     * unassign simultaniously
     */
    const promises = [];

    for (let i = 0; i < NBR_OF_UPDATED; i++) {
      promises.push(
        new Promise<any>(async (resolve) => {
          const assignRes1 = await global.fetch('http://admin.acss.dev/api/devices/unassign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId: device.id,
              patientId: patient.id,
            }),
          });
          resolve(assignRes1);
        }),
      );
    }
    const results = await Promise.all(promises);
    expect(results.length).toEqual(NBR_OF_UPDATED);
    const updates = results.filter((x) => !!x.device);
    expect(updates.length).toBeLessThanOrEqual(1);
    if (updates.length == 1) {
      expect(updates[0].device.versionKey).toEqual(3);
    } else {
      /**
       * No updates/unassignment were made. This occurs if the patient replication has not reached the device service.
       */
      results.forEach((r) => {
        expect(r.errors.length).toEqual(1);
        expect(r.errors[0].message).toContain(`patient ${patient.id} not found`);
      });
    }
  }
});

// module is any file which contains an import or export
export {};
