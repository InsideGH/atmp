import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/liveness', async (req: Request, res: Response) => {
  res.status(200).send({
    status: 'ok',
  });
});

router.get('/readiness', async (req: Request, res: Response) => {
  res.status(200).send({
    status: 'ok',
  });
});

router.get('/startup', async (req: Request, res: Response) => {
  res.status(200).send({
    status: 'ok',
  });
});

export { router as probeRouter };
