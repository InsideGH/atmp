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
   * Update the patient SEQUENCIALLY
   */
  const allUpdates = [];
  for (let i = 1; i <= NBR_OF_UPDATED; i++) {
    const newName = `${create.patient.name} - update ${String.fromCharCode(96 + i)}`;
    const foo = await global.fetch('http://admin.acss.dev/api/patients', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: create.patient.id,
        firstName: newName,
      }),
    });
    allUpdates.push(foo);
  }

  /**
   * AND add a delete patient
   */
  const deleteRes = await global.fetch('http://admin.acss.dev/api/patients', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: create.patient.id,
    }),
  });

  console.log(`deleted at versionKey=${deleteRes.patient.versionKey}`);

  expect(allUpdates.length).toEqual(NBR_OF_UPDATED);
  const successUpdates = allUpdates.filter((u) => !!u.patient);
  /**
   * Patient get versionKey = 1 when it's created. This means, 0 updates leads to versionKey of 1.
   */
  expect(successUpdates.length + 1).toEqual(deleteRes.patient.versionKey);

  const failedUpdates = allUpdates.filter((u) => !!u.errors);

  expect(failedUpdates.length - 1).toEqual(NBR_OF_UPDATED - deleteRes.patient.versionKey);
  failedUpdates.forEach((failedUpdate) => {
    expect(failedUpdate.errors.length).toEqual(1);
    expect(failedUpdate.errors[0].message).toContain(
      `Patient update FAIL - ${create.patient.id} not found`,
    );
  });
});
