import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../common/middlewares/validate-request';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { BadRequestError } from '../common/errors/bad-request-error';
import { logger } from '../common/logger/pino';

const router = express.Router();

router.put(
  '/',
  [
    body('hwId').not().isEmpty().withMessage('hwId is required'),
    body('state').not().isEmpty().withMessage('state is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { hwId, state } = req.body;

    const transaction = await db.sequelize.transaction();

    try {
      const alarm = await models.Alarm.findOne({
        where: {
          hwId,
        },
        transaction,
      });

      if (!alarm) {
        throw new BadRequestError('Update failed, alarm entry not found');
      }

      const newVersionKey = alarm.versionKey + 1;

      await alarm.update({
        state,
        versionKey: newVersionKey,
      });

      const event = await models.Event.create(
        {
          data: {},
          versionKey: newVersionKey,
        },
        { transaction },
      );

      await event.setAlarm(alarm, { transaction });

      await transaction.commit();

      logger.info(`Alarm id=${alarm.id} updated`);

      res.status(200).send({
        alarm,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as updateAlarmRouter };
