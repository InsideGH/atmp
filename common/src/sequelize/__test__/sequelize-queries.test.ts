import { sequelizeQueries } from '../sequelize-queries';
import { Op } from 'sequelize';

it('build empty where if nothing is given', () => {
  let filters = undefined;
  let excludedFilters = undefined;
  let where;

  where = sequelizeQueries.buildWhereFromFilters(undefined, undefined, undefined);
  expect(where).toEqual({});

  where = sequelizeQueries.buildWhereFromFilters(undefined, undefined, {});
  expect(where).toEqual({});
});

it('return where as given if nothing is given', () => {
  let filters = undefined;
  let excludedFilters = undefined;
  let where;

  where = sequelizeQueries.buildWhereFromFilters(undefined, undefined, {
    kalle: 'anka',
  });

  expect(where).toEqual({
    kalle: 'anka',
  });
});

it('return where if only filters is given', () => {
  let filters = {
    subject: ['patient:created', 'patient: updated'],
  };
  let excludedFilters = undefined;
  let where;

  where = sequelizeQueries.buildWhereFromFilters(filters, undefined, {
    kalle: 'anka',
  });

  expect(where).toEqual({
    kalle: 'anka',
    subject: {
      [Op.in]: ['patient:created', 'patient: updated'],
    },
  });
});

it('return where if both filters and exclude is given', () => {
  let filters = {
    subject: ['patient:created', 'patient: updated'],
  };
  let excludedFilters = {
    subject: ['patient: updated'],
  };
  let where;

  where = sequelizeQueries.buildWhereFromFilters(filters, excludedFilters, {
    kalle: 'anka',
  });

  expect(where).toEqual({
    kalle: 'anka',
    subject: {
      [Op.in]: ['patient:created', 'patient: updated'],
      [Op.notIn]: ['patient: updated'],
    },
  });
});

it('return where if both filters and exclude is given without starting where', () => {
  let filters = {
    subject: ['patient:created', 'patient: updated'],
  };
  let excludedFilters = {
    subject: ['patient: updated'],
  };
  let where;

  where = sequelizeQueries.buildWhereFromFilters(filters, excludedFilters);

  expect(where).toEqual({
    subject: {
      [Op.in]: ['patient:created', 'patient: updated'],
      [Op.notIn]: ['patient: updated'],
    },
  });
});

it('return where if both filters and exclude is given with undefined input where', () => {
  let filters = {
    subject: ['patient:created', 'patient: updated'],
  };
  let excludedFilters = {
    subject: ['patient: updated'],
  };
  let where;

  where = sequelizeQueries.buildWhereFromFilters(filters, excludedFilters, undefined);

  expect(where).toEqual({
    subject: {
      [Op.in]: ['patient:created', 'patient: updated'],
      [Op.notIn]: ['patient: updated'],
    },
  });
});

it('build empty order if nothing is given', () => {
  let sorter = undefined;
  let order;

  order = sequelizeQueries.buildOrderFromSorter(sorter);
  expect(order).toEqual([]);
});

// https://sequelize.org/master/manual/model-querying-basics.html#ordering
it('build order if sorter is given', () => {
  let sorter = [
    {
      field: 'subject',
      order: 'ascend',
    },
    {
      field: 'id',
      order: 'decendddddddddddwhatever',
    },
  ];
  let order;

  order = sequelizeQueries.buildOrderFromSorter(sorter);
  expect(order).toEqual([
    ['subject', 'ASC'],
    ['id', 'DESC'],
  ]);
});
