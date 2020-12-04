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

router.post(
  '/',
  [body('type').not().isEmpty().withMessage('device type is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      await transaction.commit();
      res.status(201).send({});
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as newDeviceRoute };
