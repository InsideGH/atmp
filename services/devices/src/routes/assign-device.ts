import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  logger,
  Subjects,
  DeviceCreatedEvent,
  eventPersistor,
  BadRequestError,
  DeviceUpdatedEvent,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { DeviceRecord } from '../record/device-record';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/assign',
  [
    body('deviceId').not().isEmpty().withMessage('deviceId  is required'),
    body('patientId').not().isEmpty().withMessage('patientId  is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      body: { deviceId, patientId },
    } = req;

    const transaction = await db.sequelize.transaction();
    try {
      const device = await models.Device.findByPk(deviceId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      /**
       * CHECK
       */
      if (!device) {
        throw new BadRequestError(`[ REQ ] Device assign FAIL - device ${deviceId} not found`);
      }

      /**
       * CHECK
       */
      const patient = await models.Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new BadRequestError(`[ REQ ] Device assign FAIL - patient ${patientId} not found`);
      }
      /**
       * CHECK
       */
      const deviceAssignedTo = await device.getPatient({ transaction });
      if (deviceAssignedTo) {
        throw new BadRequestError(
          `[ REQ ] Device assign FAIL - device ${device.id} already assigned to other patient`,
        );
      }

      await device.setPatient(patient, { transaction });

      await device.update(
        {
          versionKey: device.versionKey + 1,
        },
        { transaction },
      );

      const internalPublisher = eventPersistor.getPublisher<DeviceUpdatedEvent>({
        subject: Subjects.DeviceUpdated,
        data: {
          id: device.id,
          type: device.type,
          versionKey: device.versionKey,
          patientId: patient.id,
        },
      });

      await internalPublisher.createDbEntry(transaction);

      const record = await new DeviceRecord(
        natsWrapper.client,
        'Device assigned',
        device,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      logger.info(`[ REQ ] Device assign OK - ${device.id} assigned to ${patient.id}`);

      res.status(200).send({ device });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as assignDeviceRoute };
