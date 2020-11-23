import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, logger } from '@thelarsson/acss-common';
import { natsWrapper } from '@thelarsson/acss-common';
// import cron from 'node-cron';

const onExit = async () => {
  logger.info('Disconnect from db - ..');
  await db.disconnect();
  logger.info('Disconnect from db - ok');

  logger.info('Disconnect from nats - ..');
  await natsWrapper.disconnect();
  logger.info('Disconnect from nats - ok');

  process.exit();
};

const start = async () => {
  assertEnvVariables([
    'PATIENTS_DB_USER',
    'PATIENTS_DB_NAME',
    'PATIENTS_DB_USER_PASSWORD',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'NATS_CLIENT_ID',
    'LOG_LEVEL',
  ]);

  try {
    logger.info('Connect to db - ..');
    await db.connect();
    logger.info('Connect to db - ok');

    logger.info('Initialize db - ..');
    await initialize(db);
    logger.info('Initialize db - ok');

    logger.info('Connect to nats - ..');
    natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!,
    );
    logger.info('Connect to nats - ok');

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT');
      await onExit();
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM');
      await onExit();
    });
  } catch (error) {
    logger.error(error);
  }

  logger.info('App listen 3000 - ..');
  app.listen(3000, () => {
    logger.info('App listen 3000 - ok');
  });
};

start();
