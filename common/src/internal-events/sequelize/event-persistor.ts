import { Stan } from 'node-nats-streaming';
import { InternalListener } from './internal-listener';
import { internalEventHandler } from '../internal-event-handler';
import { CronNatsPublisher } from './cron-nats-publisher';
import { InternalPublisher } from './internal-publisher';
import { BaseEvent } from '../../events/base/base-event';

interface EventPersistorConfig {
  client: Stan;
}

export class EventPersistor {
  cronNatsPublisher?: CronNatsPublisher;
  private isStarted = false;

  constructor(private config: EventPersistorConfig) {}

  start() {
    if (!this.isStarted) {
      this.cronNatsPublisher = new CronNatsPublisher(this.config.client);
      new InternalListener(this.config.client).listen(internalEventHandler);
      this.cronNatsPublisher.start();
    }
  }

  stop() {
    if (this.isStarted) {
      if (this.cronNatsPublisher) {
        this.cronNatsPublisher.stop();
      }
      internalEventHandler.closeAll();
    }
  }

  getPublisher<T extends BaseEvent>(event: T) {
    return new InternalPublisher<T>(event);
  }
}
