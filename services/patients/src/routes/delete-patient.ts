import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  logger,
  Subjects,
  eventPersistor,
  BadRequestError,
  PatientDeletedEvent,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { PatientRecord } from '../record/patient-record';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/',
  [body('id').isNumeric().withMessage('patiend id is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findByPk(body.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!patient) {
        throw new BadRequestError(`[ REQ ] Patient delete FAIL - ${body.id} not found`);
      }

      const internalPublisher = eventPersistor.getPublisher<PatientDeletedEvent>({
        subject: Subjects.PatientDeleted,
        data: {
          id: patient.id,
          versionKey: patient.versionKey + 1,
        },
      });

      await patient.destroy({ transaction });

      await internalPublisher.createDbEntry(transaction);

      const record = await new PatientRecord(
        natsWrapper.client,
        'Patient deleted',
        patient,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      logger.info(`[ REQ ] Patient delete OK - ${patient.id}.${patient.versionKey}`);

      res.status(200).send({
        deleted: true,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as deletePatientRoute };
