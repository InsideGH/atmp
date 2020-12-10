import express, { Request, Response } from 'express';
import { Subjects } from '@thelarsson/acss-common';

const router = express.Router();

router.get('/subjects', async (req: Request, res: Response) => {
  res.status(200).send(Object.values(Subjects).sort());
});

export { router as getSubjectsRoute };
