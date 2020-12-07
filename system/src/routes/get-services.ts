import express, { Request, Response } from 'express';
import { Services } from '@thelarsson/acss-common';

const router = express.Router();

router.get('/services', async (req: Request, res: Response) => {
  res.status(200).send(Object.values(Services).sort());
});

export { router as getServicesRoute };
