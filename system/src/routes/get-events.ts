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

const router = express.Router();

router.post('/', validateRequest, async (req: Request, res: Response) => {
  const { body } = req;

  const events = await models.Event.findAndCountAll({});
  res.status(200).send(events);
});

export { router as getEventsRoute };
