import { EventEmitter } from 'events';
import { logger } from '../logger/pino';

class MyEventEmitter extends EventEmitter {}

export class InternalEventHandler {
  /**
   * Instance of node EventEmitter
   */
  private eventHandler;

  /**
   * Create.
   */
  constructor() {
    this.eventHandler = new MyEventEmitter();
  }

  /**
   * Register a listener.
   * @param onEvent callback function
   */
  listen(onEvent: (id: number) => any) {
    this.eventHandler.on('internal-event', (id: number) => {
      onEvent(id);
    });
  }

  /**
   * Publish event
   */
  publish(id: number): void {
    this.eventHandler.emit('internal-event', id);
  }

  /**
   * Remove all event listeners.
   */
  closeAll() {
    this.eventHandler.removeAllListeners('internal-event');
  }
}

export const internalEventHandler = new InternalEventHandler();
