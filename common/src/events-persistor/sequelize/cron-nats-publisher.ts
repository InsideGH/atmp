import { logger } from '../../logger/pino';
import cron from 'cron';
import { NatsPublisher } from './nats-publisher';
import { cronNatsJob } from './cron-nats-job';
import { Stan } from 'node-nats-streaming';

/**
 * Sets up a cron job that will run a job periodically. Provides a nats publisher for the job task.
 */
export class CronNatsPublisher {
  private cronJob?: cron.CronJob;
  private publisher: NatsPublisher;

  constructor(stan: Stan) {
    this.publisher = new NatsPublisher(stan, 'cron');
  }

  start() {
    if (!this.cronJob) {
      this.cronJob = new cron.CronJob('*/5 * * * * *', async () => {
        try {
          logger.info('cron-nats-publisher: starting');
          const count = await cronNatsJob(this.publisher);
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
