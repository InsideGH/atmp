import nats, { Stan } from 'node-nats-streaming';

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
    this._client = nats.connect(clusterId, clientId, { url });

    this._client.on('close', (err?) => {
      console.log(`nats-wrapper: close received ${err}`);
    });
    this._client.on('disconnect', () => {
      console.log('nats-wrapper: disconnect received');
    });
    this._client.on('reconnect', () => {
      console.log('nats-wrapper: reconnect received');
    });
    this._client.on('reconnecting', () => {
      console.log('nats-wrapper: reconnecting received');
    });
    this._client.on('error', (err) => {
      console.log(`nats-wrapper: error received ${err}`);
    });
    this._client.on('permission_error', () => {
      console.log('nats-wrapper: permission_error received');
    });
    this._client.on('connection_lost', () => {
      console.log('nats-wrapper: connection_lost received');
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

  disconnect() {
    return new Promise((resolve) => {
      if (!this._client) {
        return resolve(true);
      }

      this._client.on('close', () => {
        console.log('nats-wrapper: disconnect called and close event received ok');
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
