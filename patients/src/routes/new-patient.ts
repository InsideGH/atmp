import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  logger,
  Subjects,
  PatientCreatedEvent,
  eventPersistor,
} from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';

const router = express.Router();

router.post(
  '/',
  [body('firstName').not().isEmpty().withMessage('patient firstName is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.create(
        {
          name: body.firstName,
          versionKey: 0,
        },
        { transaction },
      );

      const internalPublisher = eventPersistor.getPublisher<PatientCreatedEvent>({
        subject: Subjects.PatientCreated,
        data: {
          id: patient.id,
          name: patient.name,
          versionKey: patient.versionKey,
        },
      });
      
      await internalPublisher.createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();

      logger.info(`Patient id=${patient.id} created`);

      res.status(201).send({
        patient,
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('new-patient', error);
      throw error;
    }
  },
);

export { router as newPatientRoute };
