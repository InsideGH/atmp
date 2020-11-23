import nats, { Stan } from 'node-nats-streaming';
import { logger } from '../logger/pino';

class Nats {
  /**
   * This property might be undefined in between creation and connect call.
   */
  private _client?: Stan;

  /**
   * Typescript getter.
   *
   * Accessed from outside/inside like so: natsInstance.client
   */
  get client() {
    if (!this._client) {
      throw new Error('Cannot access Nats client before connecting');
    }
    return this._client;
  }

  /**
   *
   * @param clusterId The cluster ID: -cid option
   * @param clientId Unique name of this client. Basically the pods name with random characters in the end.
   * @param url The url to Nats service.
   */
  connect(clusterId: string, clientId: string, url: string) {
    logger.info('Connect to nats - ..');

    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        logger.info('Connect to nats - ok');
        resolve(this._client);
      });

      this.client.on('error', (err) => {
        logger.info('Connect to nats - error');
        reject(err);
      });
    });
  }
}

export const natsWrapper = new Nats();
