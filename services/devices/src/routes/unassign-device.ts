import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  apiLogger,
  Subjects,
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
  '/unassign',
  [
    body('deviceId').not().isEmpty().withMessage('deviceId is required'),
    body('patientId').not().isEmpty().withMessage('patientId is required'),
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
        throw new BadRequestError(`[ REQ ] Device unassign FAIL - device ${deviceId} not found`);
      }

      /**
       * CHECK
       */
      const patient = await models.Patient.findByPk(patientId, { transaction });
      if (!patient) {
        throw new BadRequestError(`[ REQ ] Device unassign FAIL - patient ${patientId} not found`);
      }

      /**
       * CHECK
       */
      const devicePatient = await device.getPatient({ transaction });
      if (!devicePatient) {
        throw new BadRequestError(
          `[ REQ ] Device unassign FAIL - device ${device.id} not assigned to any patient`,
        );
      }
      if (devicePatient.id != patient.id) {
        throw new BadRequestError(
          `[ REQ ] Device unassign FAIL - device ${device.id} not assigned to patient ${patient.id}`,
        );
      }

      await device.setPatient(null, { transaction });
      await device.update({ versionKey: device.versionKey + 1 }, { transaction });

      const internalPublisher = eventPersistor.getPublisher<DeviceUpdatedEvent>({
        subject: Subjects.DeviceUpdated,
        data: {
          id: device.id,
          type: device.type,
          versionKey: device.versionKey,
          patientId: undefined,
        },
      });

      await internalPublisher.createDbEntry(transaction);

      const record = await new DeviceRecord(
        natsWrapper.client,
        'Device unassigned',
        device,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      apiLogger.info(`[ REQ ] Device unassign OK - ${device.id} unassigned from ${patient.id}`);

      res.status(200).send({ device });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as unassignDeviceRoute };
