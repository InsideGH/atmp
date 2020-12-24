import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import { assertEnvVariables, systemLogger } from '@thelarsson/acss-common';
import { natsWrapper } from './nats-wrapper';
import { Server } from 'socket.io';
import { SocketWrapper } from './socket/socket-wrapper';
import { EventReceiver } from './events/listeners/event-receiver';

const expressServer = require('http').createServer(app);
const ioServer: Server = require('socket.io')(expressServer);

const socketWrapper = new SocketWrapper(ioServer);

/**
 * Make sure we process.exit()
 */
const onExit = async () => {
  try {
    systemLogger.info('Closing io server');
    await socketWrapper.close();

    systemLogger.info('Closing express server');
    await new Promise<void>((resolve) => {
      expressServer.close(() => {
        resolve();
      });
    });

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
  assertEnvVariables([
    'SYSTEM_DB_USER',
    'SYSTEM_DB_NAME',
    'SYSTEM_DB_USER_PASSWORD',
    'NATS_URL',
    'NATS_CLUSTER_ID',
    'NATS_CLIENT_ID',
    'LOG_LEVEL',
  ]);

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
  await natsWrapper.connect(
    process.env.NATS_CLUSTER_ID!,
    process.env.NATS_CLIENT_ID!,
    process.env.NATS_URL!,
  );

  /**
   * Socket IO
   */
  socketWrapper.start();

  /**
   * Start listening for all events and push out to clients using socket.io.
   */
  new EventReceiver(natsWrapper.client, socketWrapper).listen();

  natsWrapper.onConnectionLost(() => {
    systemLogger.error('Connection with NATS failed, sending SIGINT to self');
    process.kill(process.pid, 'SIGINT');
  });

  /**
   * All good, spin up the express app.
   */
  expressServer.listen(3000, () => {
    systemLogger.info('App listen 3000');
  });
};

boot();
