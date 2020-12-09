import faker from 'faker';

it('should respect versionKey while handling simultanious requests', async () => {
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
   * The transaction with lock update makes sure that increasing the versionKey is done
   * at 'each' request.
   */
  const promises = [];
  for (let i = 1; i < 20; i++) {
    // if (i == 6) {
    //   promises.push(new Promise(async (resolve) => {
    //     const del = await global.fetch('http://admin.acss.dev/api/patients', {
    //       method: 'DELETE',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         id: create.patient.id,
    //       }),
    //     });      
    //   }));
    // }
    promises.push(
      new Promise<void>(async (resolve) => {
        const newName = `${create.patient.name} - update ${i}`;
        const update = await global.fetch('http://admin.acss.dev/api/patients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: create.patient.id,
            firstName: newName,
          }),
        });
        expect(update.patient.name).toEqual(newName);
        resolve();
      }),
    );
  }

  // await Promise.all(promises);

  const del = await global.fetch('http://admin.acss.dev/api/patients', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: create.patient.id,
    }),
  });
  expect(del.deleted).toBeTruthy();
});

// module is any file which contains an import or export
export {};
