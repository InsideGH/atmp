import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import {
  validateRequest,
  logger,
  Subjects,
  DeviceCreatedEvent,
  eventPersistor,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/subjects', validateRequest, async (req: Request, res: Response) => {
  res.status(200).send(Object.values(Subjects).sort());
});

router.post(
  '/events',
  [body('offset').not().isEmpty().withMessage('offset is required')],
  [body('limit').not().isEmpty().withMessage('limit is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      body: { offset, limit, sorter = [], filters = [] },
    } = req;

    const order = sorter
      .filter((x: any) => x.field && x.order)
      .map((x: any) => [x.field, x.order == 'ascend' ? 'ASC' : 'DESC']);

    console.log('filters', filters);

    const where: any = {};

    Object.keys(filters).forEach((key) => {
      const columnName = key;
      const values = filters[columnName];
      if (values) {
        where[columnName] = {
          [Op.in]: values,
        };
      }
    });

    console.log('where', where);

    const events = await models.Event.findAndCountAll({
      where,
      limit,
      offset,
      order,
    });
    res.status(200).send(events);
  },
);

export { router as getEventsRoute };
