import { Op } from 'sequelize';

/**
 * Check test on how to use these...
 */
const buildWhereFromFilters = (filters: any, excludedFilters: any, where: any = {}) => {
  if (filters) {
    Object.keys(filters).forEach((key) => {
      const columnName = key;
      const values = filters[columnName];
      if (values) {
        const curr = where[columnName] || {};
        where[columnName] = {
          ...curr,
          [Op.in]: values,
        };
      }
    });
  }

  if (excludedFilters) {
    Object.keys(excludedFilters).forEach((key) => {
      const columnName = key;
      const values = excludedFilters[columnName];
      if (values) {
        const curr = where[columnName] || {};
        where[columnName] = {
          ...curr,
          [Op.notIn]: values,
        };
      }
    });
  }

  return where;
};

// https://sequelize.org/master/manual/model-querying-basics.html#ordering
const buildOrderFromSorter = (sorter: any = []) => {
  const order = sorter
    .filter((x: any) => x.field && x.order)
    .map((x: any) => [x.field, x.order == 'ascend' ? 'ASC' : 'DESC']);

  return order;
};

export const sequelizeQueries = {
  buildWhereFromFilters,
  buildOrderFromSorter,
};
