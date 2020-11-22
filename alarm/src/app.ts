import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@thelarsson/acss-common';

import { newAlarmRouter } from './routes/new';
import { updateAlarmRouter } from './routes/update';

import { probeRouter } from './routes/probe';

const app = express();

// tell express to trusts traffic behind a proxy.
app.set('trust proxy', true);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("REQ", req.url);
  next();
});

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== 'test',
  }),
);

app.use(probeRouter);
app.use(newAlarmRouter);
app.use(updateAlarmRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
