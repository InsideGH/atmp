import { natsWrapper, AnyPublisher, logger } from '@thelarsson/acss-common';
import cron from 'cron';
import { models } from './sequelize/models';

class SequelizeCronPublisher {
  private cronJob?: cron.CronJob;

  private async doJob(publisher: AnyPublisher): Promise<number> {
    const events = await models.Event.findAll({
      where: {
        sent: false,
      },
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      /**
       * If this doesn't throw we know that the event has been
       * accepted by nats.
       *
       * If nats is down, it will throw, and we will bail everything
       * for this cron round.
       *
       * But before the client actually throws, we will wait, and possibly other cron jobs
       * might start depending on cron config string.
       */
      await publisher.publish({
        subject: event.subject,
        data: event.data,
      });
      logger.debug(`sequelize-cron-publisher: sent event id=${event.id} subject=${event.subject} to nats`);

      /**
       * If the following fails for some reason, the event will still be in non-sent state and
       * will be handled in future cron round (thus the event will be sent multiple times)
       */
      event.sent = true;
      await event.save();
    }

    return events.length;
  }

  start() {
    if (!this.cronJob) {
      const publisher = new AnyPublisher(natsWrapper.client, true, 'cron');

      this.cronJob = new cron.CronJob('*/5 * * * * *', async () => {
        try {
          logger.info(`sequelize-cron-publisher: starting`);
          const count = await this.doJob(publisher);
          logger.info(`sequelize-cron-publisher: handled ${count} events`);
        } catch (error) {
          logger.error(`sequelize-cron-publisher: catched error ${error}`);
        }
      });

      this.cronJob.start();
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }
}

export const sequelizeCronPublisher = new SequelizeCronPublisher();
