import { eventLogger } from '../../logger/pino';
import cron from 'cron';
import { NatsPublisher } from './nats-publisher';
import { cronNatsJob } from './cron-nats-job';
import { EventPersistorConfig } from './event-persistor';

/**
 * Sets up a cron job that will run THE job (cronNatsJob) periodically.
 *
 * You can do 3 things
 *
 * 1) Create it
 * 2) Start it
 * 3) Stop it
 *
 */
export class CronNatsPublisher {
  private cronJob?: cron.CronJob;
  private publisher: NatsPublisher;

  constructor(private config: EventPersistorConfig) {
    this.publisher = new NatsPublisher(config.client, 'CRON');
  }

  start() {
    if (!this.cronJob) {
      this.cronJob = new cron.CronJob(this.config.cron.cronString, async () => {
        eventLogger.info('[CRON] starting');
        const count = await cronNatsJob(this.publisher);
        eventLogger.info(`[CRON] handled ${count} events`);
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
