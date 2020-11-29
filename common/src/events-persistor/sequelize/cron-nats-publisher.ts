import { logger } from '../../logger/pino';
import cron from 'cron';
import { NatsPublisher } from './nats-publisher';
import { cronNatsJob } from './cron-nats-job';
import { EventPersistorConfig } from './event-persistor-config';

/**
 * Sets up a cron job that will run a job periodically. Provides a nats publisher for the job task.
 */
export class CronNatsPublisher {
  private cronJob?: cron.CronJob;
  private publisher: NatsPublisher;

  constructor(private config: EventPersistorConfig) {
    this.publisher = new NatsPublisher(config.client, 'cron');
  }

  start() {
    if (!this.cronJob) {
      this.cronJob = new cron.CronJob(this.config.cron.cronString, async () => {
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
