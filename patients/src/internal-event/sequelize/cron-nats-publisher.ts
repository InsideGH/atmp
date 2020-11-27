import { logger } from '@thelarsson/acss-common';
import cron from 'cron';
import { NatsPublisher } from './nats-publisher';
import { cronNatsJob } from './cron-nats-job';

class CronNatsPublisher {
  private cronJob?: cron.CronJob;

  start() {
    if (!this.cronJob) {
      const natsPublisher = new NatsPublisher('cron');

      this.cronJob = new cron.CronJob('*/5 * * * * *', async () => {
        try {
          logger.info('cron-nats-publisher: starting');
          const count = await cronNatsJob(natsPublisher);
          logger.info(`cron-nats-publisher: handled ${count} events`);
        } catch (error) {
          logger.error(`cron-nats-publisher: catched error ${error}`);
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

export const cronNatsPublisher = new CronNatsPublisher();
