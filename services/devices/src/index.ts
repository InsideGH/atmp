import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, systemLogger } from '@thelarsson/acss-common';
import { eventPersistor } from '@thelarsson/acss-common';
import { natsWrapper } from './nats-wrapper';
import { PatientCreatedListener } from './events/listeners/patient-created-listener';
import { PatientUpdatedListener } from './events/listeners/patient-updated-listener';
import { PatientDeletedListener } from './events/listeners/patient-deleted-listener';

import { Server } from 'http';

let expressServer: Server;

/**
 * Make sure we process.exit()
 */
const onExit = async () => {
  try {
    if (expressServer) {
      systemLogger.info('Closing express server');
      await new Promise<void>((resolve) => {
        expressServer.close(() => {
          resolve();
        });
      });
    }

    systemLogger.info('Closing event persistor');
    eventPersistor.stop();

    systemLogger.info('Disconnect from db');
    await db.disconnect();

    systemLogger.info('Disconnect from nats');
    await natsWrapper.disconnect();

    systemLogger.info('Everything stopped. Bye!');
  } catch (error) {
    systemLogger.error(error, 'Catched error during onExit');
    process.exit(1);
  } finally {
    process.exit(0);
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
  assertEnvVariables(['DEVICES_DB_USER', 'DEVICES_DB_NAME', 'DEVICES_DB_USER_PASSWORD', 'NATS_URL', 'NATS_CLUSTER_ID', 'NATS_CLIENT_ID', 'LOG_LEVEL']);

  /**
   * Set up these first just in case they are needed.
   */
  process.on('SIGINT', () => {
    systemLogger.info('Received SIGINT');
    onExit();
  });
  process.on('SIGTERM', () => {
    systemLogger.info('Received SIGTERM');
    onExit();
  });

  /**
   * DB
   */
  systemLogger.info('Connect to db');
  await db.connect();
  systemLogger.info('Initialize db');
  await initialize(db);

  /**
   * NATS
   */
  systemLogger.info('Connect to nats');
  await natsWrapper.connect(process.env.NATS_CLUSTER_ID!, process.env.NATS_CLIENT_ID!, process.env.NATS_URL!);

  /**
   * Send events to nats even if nats would be down.
   */
  eventPersistor.start({
    client: natsWrapper.client,
    cron: {
      cronString: '*/5 * * * * *',
    },
  });

  new PatientCreatedListener(natsWrapper.client).listen();
  new PatientUpdatedListener(natsWrapper.client).listen();
  new PatientDeletedListener(natsWrapper.client).listen();

  natsWrapper.onConnectionLost(() => {
    systemLogger.error('Connection with NATS failed, sending SIGINT to self');
    process.kill(process.pid, 'SIGINT');
  });

  /**
   * All good, spin up the express app.
   */
  expressServer = app.listen(3000, () => {
    systemLogger.info('App listen 3000');
  });
};

boot();
