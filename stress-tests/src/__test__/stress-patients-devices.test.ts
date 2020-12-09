import faker from 'faker';

it('should respect versionKey while handling simultanious requests', async () => {
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
   * Delete the patient
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

// module is any file which contains an import or export
export {};
