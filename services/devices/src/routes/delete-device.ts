import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  apiLogger,
  Subjects,
  eventPersistor,
  BadRequestError,
  DeviceDeletedEvent,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { DeviceRecord } from '../record/device-record';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/',
  [body('id').isNumeric().withMessage('device id is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      const device = await models.Device.findByPk(body.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!device) {
        throw new BadRequestError(`[ REQ ] Device delete FAIL - ${body.id} not found`);
      }

      const internalPublisher = eventPersistor.getPublisher<DeviceDeletedEvent>({
        subject: Subjects.DeviceDeleted,
        data: {
          id: device.id,
          versionKey: device.versionKey,
        },
      });

      await device.destroy({ transaction });

      await internalPublisher.createDbEntry(transaction);

      const record = await new DeviceRecord(
        natsWrapper.client,
        'Device deleted',
        device,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      apiLogger.info(`[ REQ ] Device delete OK - ${device.id} deleted`);

      res.status(200).send({
        deleted: true,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as deleteDeviceRoute };
