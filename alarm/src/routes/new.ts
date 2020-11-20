import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, logger } from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
const router = express.Router();

router.post(
  '/',
  [body('hwId').not().isEmpty().withMessage('hwId is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { hwId } = req.body;

    const transaction = await db.sequelize.transaction();

    try {
      const alarm = await models.Alarm.create(
        {
          hwId,
          state: 'created',
          versionKey: 0,
        },
        { transaction },
      );

      const event = await models.Event.create(
        {
          data: {},
          versionKey: 0,
        },
        { transaction },
      );

      await event.setAlarm(alarm, { transaction });
      await alarm.addEvent(event, { transaction });

      await transaction.commit();

      logger.info(`Alarm id=${alarm.id} created`);

      res.status(201).send({
        alarm,
        event,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as newAlarmRouter };
