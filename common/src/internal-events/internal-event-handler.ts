import { EventEmitter } from 'events';
import { logger } from '../logger/pino';

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
      logger.error('internal-event error: ', err);
    });
  }

  /**
   * Register a listener.
   * @param onEvent callback function
   */
  listen(onEvent: (id: string | number) => any) {
    this.eventHandler.on('internal-event', (id: string | number) => {
      onEvent(id);
    });
  }

  /**
   * Publish event
   */
  publish(id: string | number): void {
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
