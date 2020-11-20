import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, logger } from '@thelarsson/acss-common';

const onExit = async () => {
  await db.disconnect();
  process.exit();
};

const start = async () => {
  assertEnvVariables(['PATIENTS_DB_USER', 'PATIENTS_DB_NAME', 'PATIENTS_DB_USER_PASSWORD']);

  try {
    logger.info('Connect to db - ..');
    await db.connect();
    logger.info('Connect to db - ok');

    logger.info('Initialize db - ..');
    await initialize(db);
    logger.info('Initialize db - ok');

    process.on('SIGINT', () => {
      logger.info('Received SIGINT');
      onExit();
    });

    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM');
      onExit();
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
