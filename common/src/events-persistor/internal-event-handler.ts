import { EventEmitter } from 'events';

/**
 * Internal event emitter that can register listeners and publish to.
 *
 * The only thing that can be published is a number (id), which is the id of the event in the database.
 *
 * The event emitter can be closed down and it will remove all registered listeners.
 */
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

/**
 * Make sure we only can create one single instance
 */
export const internalEventHandler = new InternalEventHandler();
