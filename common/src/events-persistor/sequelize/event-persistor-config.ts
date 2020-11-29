import { Stan } from 'node-nats-streaming';

export interface EventPersistorConfig {
  client: Stan;
  cron: {
    cronString: string;
  };
}
