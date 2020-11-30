import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  logger,
  Subjects,
  PatientCreatedEvent,
  eventPersistor,
  BadRequestError,
  PatientUpdatedEvent,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';

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
      const patient = await models.Patient.findByPk(body.id, { transaction });

      if (!patient) {
        throw new BadRequestError(`Patient with id=${body.id} not found`);
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

      await transaction.commit();

      internalPublisher.publish();

      logger.info(`Patient id=${patient.id} updated`);

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
