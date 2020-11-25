import { app } from './app';
import db from './sequelize/database';
import { initialize } from './sequelize/initialize';
import {
  assertEnvVariables,
  logger,
  PatientCreatedEvent,
  Subjects,
  BaseEvent,
} from '@thelarsson/acss-common';
import { natsWrapper,internalEventHandler } from '@thelarsson/acss-common';
import cron from 'node-cron';
import { Models, models } from './sequelize/models';
import { PatientCreatedPublisher } from './events/publishers/patient-created-publisher';
import { SequelizeNatsPublisher } from './sequelize-nats-publisher';

// cron.schedule('*/20 * * * * *', async () => {
//   console.log('running every 20 sec');

//   const events = await models.Event.findAll({
//     where: {
//       sent: false,
//     },
//   });

//   if (events.length) {
//     for (let i = 0; i < events.length; i++) {
//       const event = events[i];
//       console.log('event found: ', event.dataValues);
//       await new PatientCreatedPublisher(natsWrapper.client, true).publish({
//         ...event.data,
//       });
//       event.sent = true;
//       await event.save();
//     }
//   }
// });

// internalEventHandler.listen(async (id: string) => {
//   logger.info(`Internal event received ${id}`);

//   const event = await models.Event.findByPk(id);

//   if (event && !event.sent) {
//     await new PatientCreatedPublisher(natsWrapper.client, true).publish({
//       ...event.data,
//     });
//     event.sent = true;
//     await event.save();
//   }
// });

const onExit = async () => {
  logger.info('Disconnect from db');
  await db.disconnect();

  logger.info('Disconnect from nats');
  await natsWrapper.disconnect();

  logger.info('Closing all internal event emitter listeners');
  internalEventHandler.close();

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
