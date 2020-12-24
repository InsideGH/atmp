import nats, { Stan } from 'node-nats-streaming';
import { systemLogger } from '@thelarsson/acss-common';

class NatsWrapper {
  /**
   * This property might be undefined in between creation and connect call.
   */
  private _client?: Stan;

  /**
   * Are we connected or not?
   */
  public isConnected: boolean = false;

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
   * Connect to nats server.
   *
   * @param clusterId The cluster ID: -cid option
   * @param clientId Unique name of this client. Basically the pods name with random characters in the end.
   * @param url The url to Nats service.
   */
  connect(clusterId: string, clientId: string, url: string) {
    /**
     *
     * Flow when the nats server is taken down for example.
     * 1. disconnect
     * 2. reconnecting * x times
     * 3. connection_lost
     * 4. close
     *
     * 'stanMaxPingOut' decides how many times we will try 'reconnecting'
     *
     */
    this._client = nats.connect(clusterId, clientId, {
      url,
      ackTimeout: 30000,
      connectTimeout: 2000,
      stanMaxPingOut: 3, // default 3
      stanPingInterval: 5000,
    });

    /**
     * When connect, save state about it.
     */
    this._client.on('connect', () => {
      systemLogger.info('nats-wrapper: connect received');
      this.isConnected = false;
    });

    /**
     * When close, save state about it.
     */
    this._client.on('close', () => {
      systemLogger.info('nats-wrapper: close received');
      this.isConnected = false;
    });

    /**
     * These are here for educational purposes.
     */
    this._client.on('disconnect', () => {
      systemLogger.info('nats-wrapper: disconnect received');
    });
    this._client.on('reconnect', () => {
      systemLogger.info('nats-wrapper: reconnect received');
    });
    this._client.on('reconnecting', () => {
      systemLogger.info('nats-wrapper: reconnecting received');
    });
    this._client.on('error', (err) => {
      systemLogger.error(`nats-wrapper: error received ${err}`);
    });
    this._client.on('permission_error', () => {
      systemLogger.error('nats-wrapper: permission_error received');
    });
    this._client.on('connection_lost', () => {
      systemLogger.error('nats-wrapper: connection_lost received');
    });

    /**
     * Return a promise that can be awaited for to get connected.
     */
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
        systemLogger.error('nats-wrapper: onConnectionLost cb connection_lost received');
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
        systemLogger.info('nats-wrapper: disconnect called and close event received ok');
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
