import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, logger } from '@thelarsson/acss-common';
import { eventPersistor } from '@thelarsson/acss-common';
import { natsWrapper } from './nats-wrapper';
import { PatientCreatedListener } from './events/listeners/patient-created-listener';
import { PatientUpdatedListener } from './events/listeners/patient-updated-listener';
import { Server } from 'http';

let expressServer: Server;

/**
 * Make sure we process.exit()
 */
const onExit = async () => {
  try {
    if (expressServer) {
      logger.info('Closing express server');
      await new Promise<void>((resolve) => {
        expressServer.close(() => {
          resolve();
        });
      });
    }

    logger.info('Closing event persistor');
    eventPersistor.stop();

    logger.info('Disconnect from db');
    await db.disconnect();

    logger.info('Disconnect from nats');
    await natsWrapper.disconnect();

    logger.info('Everything stopped. Bye!');
  } catch (error) {
  } finally {
    process.exit();
  }
};

/**
 * BOOT
 */
const boot = async () => {
  /**
   * If some env variables are wrong, we throw and the node
   * process will NOT continue, but it will NOT exit either.
   *
   * This means that kubernetes will just think that everything
   * is OK. (we don't have any liveness probes setup).
   */
  assertEnvVariables([
    'DEVICES_DB_USER',
    'DEVICES_DB_NAME',
    'DEVICES_DB_USER_PASSWORD',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'NATS_CLIENT_ID',
    'LOG_LEVEL',
  ]);

  /**
   * If something throws inside the try/catch, we will SIGINT and
   * kubernetes will restart our pod exponential with back-off
   * delay (10s, 20s, 40s, …), that is capped at five minutes.
   */
  /**
   * Set up these first just in case they are needed.
   */
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT');
    await onExit();
  });
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM');
    await onExit();
  });

  /**
   * DB
   */
  logger.info('Connect to db');
  await db.connect();
  logger.info('Initialize db');
  await initialize(db);

  /**
   * NATS
   */
  logger.info('Connect to nats');
  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID!,
    process.env.NATS_CLIENT_ID!,
    process.env.NATS_URL!,
  );

  /**
   * Send events to nats even if nats would be down.
   */
  eventPersistor.start({
    client: natsWrapper.client,
    cron: {
      cronString: '0 0 */1 * * *',
    },
  });

  new PatientCreatedListener(natsWrapper.client).listen();
  new PatientUpdatedListener(natsWrapper.client).listen();

  natsWrapper.onConnectionLost(() => {
    logger.error('Connection with NATS failed, sending SIGINT to self');
    process.kill(process.pid, 'SIGINT');
  });

  /**
   * All good, spin up the express app.
   */
  expressServer = app.listen(3000, () => {
    logger.info('App listen 3000');
  });
};

boot();
