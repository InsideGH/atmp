import express, { Request, Response } from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import { body } from 'express-validator';

import { NotFoundError } from '../errors/not-found-error';
import { errorHandler } from '../middlewares/error-handler';
import { validateRequest } from '../middlewares/validate-request';
import { BadRequestError } from '../errors/bad-request-error';

const app = express();
const router = express.Router();

app.use(json());

router.post(
  '/test',
  [body('code').not().isEmpty().withMessage('code is required')],
  validateRequest,
  async (req: Request, res: Response) => {
    const { body } = req;

    try {
      if (body.code.startsWith('throw-bad-request-error')) {
        throw new BadRequestError('My bad request message');
      }
      if (body.code.startsWith('throw-error')) {
        throw new Error('My vanilla error message');
      }
      res.status(200).send({});
    } catch (error) {
      throw error;
    }
  },
);

app.use(router);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
