import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, logger } from '@thelarsson/acss-common';
import db from '../sequelize/database';
import { models } from '../sequelize/models';
const router = express.Router();

router.post(
  '/patient',
  [body('firstName').not().isEmpty().withMessage('patient firstName is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const transaction = await db.sequelize.transaction();

    try {
      res.status(201).send({});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
);

export { router as newPatientRoute };
