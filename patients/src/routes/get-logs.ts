import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { validateRequest, sequelizeQueries } from '@thelarsson/acss-common';
import { models } from '../sequelize/models';

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

    const where = sequelizeQueries.buildWhereFromFilters(filters, excludedFilters);
    const order = sequelizeQueries.buildOrderFromSorter(sorter);

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
