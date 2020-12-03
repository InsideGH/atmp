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

const router = express.Router();

router.delete(
  '/',
  [body('id').isNumeric().withMessage('patiend id is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;
    const transaction = await db.sequelize.transaction();

    try {
      const patient = await models.Patient.findByPk(body.id, { transaction });

      if (!patient) {
        throw new BadRequestError(`Patient with id=${body.id} not found`);
      }

      const internalPublisher = eventPersistor.getPublisher<PatientDeletedEvent>({
        subject: Subjects.PatientDeleted,
        data: {
          id: patient.id,
          versionKey: patient.versionKey,
        },
      });

      await patient.destroy({ transaction });

      await internalPublisher.createDbEntry(transaction);

      await transaction.commit();

      internalPublisher.publish();

      logger.info(`Patient id=${patient.id} deleted`);

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
