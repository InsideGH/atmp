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
  cronNatsPublisher: CronNatsPublisher;

  constructor(private config: EventPersistorConfig) {
    this.cronNatsPublisher = new CronNatsPublisher(config.client);
  }

  start() {
    new InternalListener(this.config.client).listen(internalEventHandler);
    this.cronNatsPublisher.start();
  }

  stop() {
    this.cronNatsPublisher.stop();
    internalEventHandler.closeAll();
  }

  getPublisher<T extends BaseEvent>(event: T) {
    return new InternalPublisher<T>(event);
  }
}
