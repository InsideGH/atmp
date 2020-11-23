import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, logger } from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
import { PatientCreatedPublisher } from '../events/publishers/patient-created-publisher';
import { natsWrapper } from '@thelarsson/acss-common';

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

      const event = await models.Event.create(
        {
          data: {
            id: patient.id,
            name: patient.name,
            version: patient.versionKey,
          },
          sent: false,
          versionKey: 0,
        },
        { transaction },
      );

      await event.setPatient(patient, { transaction });
      await patient.addEvent(event, { transaction });

      // await new PatientCreatedPublisher(natsWrapper.client, true).publish({
      //   id: patient.id,
      //   name: patient.name,
      //   version: patient.versionKey,
      // });

      await transaction.commit();

      logger.info(`Patient id=${patient.id} created`);

      res.status(201).send({
        patient,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as newPatientRoute };
