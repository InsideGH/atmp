import nats, { Stan } from 'node-nats-streaming';
import { logger } from '../logger/pino';

class NatsWrapper {
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
    /**
     *
     * Flow when the database is taken down.
     * 1. disconnect
     * 2. reconnecting * x times
     * 3. connection_lost
     * 4. close
     *
     */
    this._client = nats.connect(clusterId, clientId, {
      url,
      ackTimeout: 30000,
      connectTimeout: 2000,
      stanMaxPingOut: 10, // default 3
      stanPingInterval: 5000,
    });

    this._client.on('close', () => {
      logger.info('nats-wrapper: close received');
    });
    this._client.on('disconnect', () => {
      logger.info('nats-wrapper: disconnect received');
    });
    this._client.on('reconnect', () => {
      logger.info('nats-wrapper: reconnect received');
    });
    this._client.on('reconnecting', () => {
      logger.info('nats-wrapper: reconnecting received');
    });
    this._client.on('error', (err) => {
      logger.error(`nats-wrapper: error received ${err}`);
    });
    this._client.on('permission_error', () => {
      logger.error('nats-wrapper: permission_error received');
    });
    this._client.on('connection_lost', () => {
      logger.error('nats-wrapper: connection_lost received');
    });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        resolve(this._client);
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }

  onConnectionLost(cb: Function) {
    if (this._client) {
      this._client.on('connection_lost', () => {
        logger.error('nats-wrapper: onConnectionLost cb connection_lost received');
        cb();
      });
    }
  }

  disconnect() {
    return new Promise((resolve) => {
      if (!this._client) {
        return resolve(true);
      }

      this._client.on('close', () => {
        logger.info('nats-wrapper: disconnect called and close event received ok');
        return resolve(true);
      });

      /**
       * When a client disconnects, the streaming server is not notified,
       * hence the importance of calling stan#close().
       *
       * stan will now send PINGs at regular intervals (default is 5000 milliseconds)
       * and will close the streaming connection after a certain number of PINGs have been
       * sent without any response (default is 3).
       */
      this._client.close();
    });
  }
}

export const natsWrapper = new NatsWrapper();
