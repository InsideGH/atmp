import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@thelarsson/acss-common';

import { getEventsRoute } from './routes/get-events';
import { getSubjectsRoute } from './routes/get-subjects';
import { getServicesRoute } from './routes/get-services';
import { clientLoggerRoute } from './routes/client-logger';

const app = express();

// tell express to trusts traffic behind a proxy.
app.set('trust proxy', true);

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

app.use(getEventsRoute);
app.use(getSubjectsRoute);
app.use(getServicesRoute);
app.use(clientLoggerRoute);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
