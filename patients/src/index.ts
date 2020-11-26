import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, logger } from '@thelarsson/acss-common';
import { natsWrapper, internalEventHandler } from '@thelarsson/acss-common';
import { SequelizeNatsPublisher } from './sequelize-nats-publisher';
import { sequelizeCronPublisher } from './sequelize-cron-publisher';

const onExit = async () => {
  logger.info('Disconnect from db');
  await db.disconnect();

  logger.info('Disconnect from nats');
  await natsWrapper.disconnect();

  logger.info('Closing all internal event emitter listeners');
  internalEventHandler.close();

  logger.info('Stopping cron publisher');
  sequelizeCronPublisher.stop();

  logger.info('Everything stopped. Bye!');

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
    logger.info('Connect to db');
    await db.connect();

    logger.info('Initialize db');
    await initialize(db);

    logger.info('Connect to nats');
    natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!,
    );

    logger.info('Listen for sequelize database entries');
    new SequelizeNatsPublisher().listen(internalEventHandler);

    logger.info('Starting cron publisher');
    sequelizeCronPublisher.start();

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

  app.listen(3000, () => {
    logger.info('App listen 3000');
  });
};

start();
