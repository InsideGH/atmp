import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest, clientWebAdminLogger } from '@thelarsson/acss-common';
const router = express.Router();

router.post(
  '/logger',
  [
    body('type').isString().withMessage('type is required'),
    body('msg').isString().not().isEmpty().withMessage('msg is required'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {
      body: { type, msg },
    } = req;

    switch (type) {
      case 'debug':
      case 'info':
      case 'error':
        clientWebAdminLogger[type](msg);
        break;

      default:
        clientWebAdminLogger.warn(msg);
        break;
    }
    res.status(200).send({});
  },
);

export { router as clientLoggerRoute };
