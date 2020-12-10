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
import { DeviceRecord } from '../record/device-record';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/',
  [body('type').not().isEmpty().withMessage('device type is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      const device = await models.Device.create(
        {
          type: body.type,
          versionKey: 1,
        },
        { transaction },
      );

      const internalPublisher = eventPersistor.getPublisher<DeviceCreatedEvent>({
        subject: Subjects.DeviceCreated,
        data: {
          id: device.id,
          type: device.type,
          versionKey: device.versionKey,
        },
      });

      await internalPublisher.createDbEntry(transaction);

      const record = await new DeviceRecord(
        natsWrapper.client,
        'Device created',
        device,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      logger.info(`[ REQ ] Device create OK - ${device.id} created`);

      res.status(201).send({
        device,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as newDeviceRoute };
