import { EventEmitter } from 'events';
import { logger } from '@thelarsson/acss-common';

class MyEventEmitter extends EventEmitter {}

export class InternalEventHandler {
  /**
   * Instance of node EventEmitter
   */
  private eventHandler;

  /**
   * Create and capture error so that node process doesn't stops if an error event is published.
   */
  constructor() {
    this.eventHandler = new MyEventEmitter();

    this.eventHandler.on('error', (err) => {
      logger.error('InternalEventHandler error: ', err);
    });
  }

  /**
   * Register a listener.
   * @param onEvent callback function
   */
  listen(onEvent: (id: string) => any) {
    this.eventHandler.on('internal-event', (id: string) => {
      onEvent(JSON.parse(id));
    });
  }

  /**
   * Publish event
   */
  publish(id: string): void {
    this.eventHandler.emit('internal-event', id);
  }

  /**
   * Remove all event listeners.
   */
  close() {
    this.eventHandler.removeAllListeners('internal-event');
  }
}

export const internalEventHandler = new InternalEventHandler();
