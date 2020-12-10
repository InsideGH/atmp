import faker from 'faker';

it('should respect versionKey while handling simultanious patient update requests', async () => {
  const NBR_OF_UPDATED = 19;
  /**
   * Create ONE patient
   */
  const create = await global.fetch('http://admin.acss.dev/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: faker.name.findName(),
    }),
  });
  expect(create.patient.versionKey).toEqual(1);

  /**
   * Update the patient SIMULATANIOUSLY
   */
  const promises = [];
  for (let i = 1; i <= NBR_OF_UPDATED; i++) {
    promises.push(
      new Promise<void>(async (resolve) => {
        const newName = `${create.patient.name} - update ${String.fromCharCode(96 + i)}`;
        const foo = await global.fetch('http://admin.acss.dev/api/patients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: create.patient.id,
            firstName: newName,
          }),
        });
        resolve();
      }),
    );
  }

  /**
   * AND add a delete patient somewhere along the way of the updates...
   */
  await global.fetch('http://admin.acss.dev/api/patients', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: create.patient.id,
    }),
  });

  await Promise.all(promises);
});

it('should update device 1 time during simultanious assign requests', async () => {
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
   * Assign simultaniously
   */
  const promises = [];

  for (let i = 0; i < NBR_OF_UPDATED; i++) {
    promises.push(
      new Promise<any>(async (resolve) => {
        const assignRes1 = await global.fetch('http://admin.acss.dev/api/devices/assign', {
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
  expect(updates.length).toEqual(1);
  expect(updates[0].device.versionKey).toEqual(2);
});

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
  expect(updates.length).toEqual(1);
  expect(updates[0].device.versionKey).toEqual(3);
});
// module is any file which contains an import or export
export {};
