import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, logger } from '@thelarsson/acss-common';
import { internalEventHandler } from '@thelarsson/acss-common';
import { InternalListener } from './internal-event/sequelize/internal-listener';
import { cronNatsPublisher } from './internal-event/sequelize/cron-nats-publisher';
import { natsWrapper } from './nats-wrapper';
/**
 * Make sure we process.exit()
 */
const onExit = async () => {
  try {
    logger.info('Disconnect from db');
    await db.disconnect();

    logger.info('Disconnect from nats');
    await natsWrapper.disconnect();

    logger.info('Closing all internal event emitter listeners');
    internalEventHandler.close();

    logger.info('Stopping cron publisher');
    cronNatsPublisher.stop();

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
    'PATIENTS_DB_USER',
    'PATIENTS_DB_NAME',
    'PATIENTS_DB_USER_PASSWORD',
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
  try {
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
     * INTERNAL EVENT HANDLING.
     *
     * Instead of sending event of to NATS directly, we
     * store them in DB and send them in the next tick
     * if NATS is alive.
     */
    logger.info('Listen for sequelize database entries');
    new InternalListener().listen(internalEventHandler);

    /**
     * INTERNAL EVENT HANDLING.
     *
     * If nats was down during event creating and first attempt
     * to send, we will try to send the events from a cron job.
     */
    logger.info('Starting cron publisher');
    cronNatsPublisher.start();
  } catch (error) {
    /**
     * If anything went wrong during boot, make sure that
     * we process exit so that kubernetes can restart us.
     */
    logger.error('Boot failed, sending SIGINT to self');
    logger.error(error);
    process.kill(process.pid, 'SIGINT');
  }

  natsWrapper.onConnectionLost(() => {
    logger.error('Connection with NATS failed, sending SIGINT to self');
    process.kill(process.pid, 'SIGINT');
  });

  /**
   * All good, spin up the express app.
   */
  app.listen(3000, () => {
    logger.info('App listen 3000');
  });
};

boot();
