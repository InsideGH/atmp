import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@thelarsson/acss-common';

import { newPatientRoute } from './routes/new-patient';
import { updatePatientRoute } from './routes/update-patient';
import { deletePatientRoute } from './routes/delete-patient';

import { probeRouter } from './routes/probe';

const app = express();

// tell express to trusts traffic behind a proxy.
app.set('trust proxy', true);

app.use(probeRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== 'test',
  }),
);

app.use(newPatientRoute);
app.use(updatePatientRoute);
app.use(deletePatientRoute);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
