/**
 * Since it's very critical in a event system to handle events getting out of order
 * this static class helper should be used in the event LISTENERS, to know WHEN to acknowledge
 * the event or not.
 */

export enum Decision {
  HANDLE_AND_ACK,
  ACK,
  NO_ACK,
}

interface QueryByPk {
  findByPk(id: number, opt: any): any;
}

export class EventListenerLogic {
  /**
   * Get a decision on how to handle the event.
   */
  static decision(event: { versionKey: number }, curr: { versionKey: number } | null): Decision {
    /**
     * OUT OF ORDER CASE
     *
     * Update event happens BEFORE create event. We NO_ACK, to process the event later.
     */
    if (!curr) {
      return Decision.NO_ACK;
    }

    /**
     * THE GOOD CASE
     *
     * The event version is one (1) ahead of the database entry. We handle the event and ack.
     */
    if (event.versionKey - curr.versionKey == 1) {
      return Decision.HANDLE_AND_ACK;
    }

    /**
     * DUPLICATION OF EVENTS CASE
     *
     * The event version is older or equal to the database entry. It must be a dup event.
     */
    if (event.versionKey <= curr.versionKey) {
      return Decision.ACK;
    }

    /**
     * OUT OF ORDER CASE
     *
     * The event version is two or more steps ahead of the database entry.
     * We NO_ACK, to process the event later.
     */
    return Decision.NO_ACK;
  }

  /**
   * Precheck at database NOT using a transaction on how to either ACK and NO_ACK the event. This can be used to
   * get a partly decision.
   */
  static async preDatabaseCheck(model: QueryByPk, event: { id: number; versionKey: number }): Promise<Decision> {
    const instance = await model.findByPk(event.id, {
      attributes: ['id', 'versionKey'],
      paranoid: false,
    });
    const decision = EventListenerLogic.decision(event, instance);
    return decision;
  }
}
