import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError } from '@thelarsson/acss-common';

import { newDeviceRoute } from './routes/new-device';
import { assignDeviceRoute } from './routes/assign-device';

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

app.use(newDeviceRoute);
app.use(assignDeviceRoute);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
