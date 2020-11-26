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

      await publisher.publish({
        subject: event.subject,
        data: event.data,
      });

      event.sent = true;

      await event.save();
    }

    return events.length;
  }

  start() {
    if (!this.cronJob) {
      const publisher = new AnyPublisher(natsWrapper.client, true);

      this.cronJob = new cron.CronJob('*/5 * * * * *', async () => {
        try {
          const count = await this.doJob(publisher);
          logger.info(`SequelizeCronPublisher handled ${count} events`);
        } catch (error) {
          logger.error(`SequelizeCronJobPublisher catched error ${error}`);
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
