import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  logger,
  Subjects,
  eventPersistor,
  BadRequestError,
  PatientUpdatedEvent,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { PatientRecord } from '../record/patient-record';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/',
  [
    body('id').isNumeric().withMessage('patiend id is required'),
    body('firstName').not().isEmpty().withMessage('patient firstName is required'),
  ],
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
        throw new BadRequestError(`[ REQ ] Patient update FAIL - ${body.id} not found`);
      }

      patient.name = body.firstName;
      patient.versionKey = patient.versionKey + 1;

      await patient.save({ transaction });

      const internalPublisher = eventPersistor.getPublisher<PatientUpdatedEvent>({
        subject: Subjects.PatientUpdated,
        data: {
          id: patient.id,
          name: patient.name,
          versionKey: patient.versionKey,
          age: 666,
        },
      });

      await internalPublisher.createDbEntry(transaction);

      const record = await new PatientRecord(
        natsWrapper.client,
        'Patient updated',
        patient,
      ).createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();
      record.publishId();

      logger.info(`[ REQ ] Patient update OK - ${patient.id}.${patient.versionKey}`);

      res.status(200).send({
        patient,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as updatePatientRoute };
