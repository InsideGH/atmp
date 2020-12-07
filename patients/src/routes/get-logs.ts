import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest } from '@thelarsson/acss-common';
import { models } from '../sequelize/models';
import { Op } from 'sequelize';

const router = express.Router();

router.post(
  '/logs',
  [body('offset').not().isEmpty().withMessage('offset is required')],
  [body('limit').not().isEmpty().withMessage('limit is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      body: { offset, limit, sorter = [], filters = [], excludedFilters = [] },
    } = req;

    const order = sorter
      .filter((x: any) => x.field && x.order)
      .map((x: any) => [x.field, x.order == 'ascend' ? 'ASC' : 'DESC']);

    const where: any = {};

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

    const events = await models.Log.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });

    res.status(200).send(events);
  },
);

export { router as getLogsRoute };
