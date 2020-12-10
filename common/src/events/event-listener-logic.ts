export enum Decision {
  HANDLE_AND_ACK,
  ACK,
  NO_ACK,
}

export class EventListenerLogic {
  static decision(event: { versionKey: number }, curr: { versionKey: number } | null): Decision {
    /**
     * OUT OF ORDER
     *
     * Update event happens BEFORE create event. We NO_ACK, to process the event later.
     */
    if (!curr) {
      return Decision.NO_ACK;
    }

    /**
     * The event version is one (1) ahead of the database entry. We handle the event and ack.
     */
    if (event.versionKey - curr.versionKey == 1) {
      return Decision.HANDLE_AND_ACK;
    }

    /**
     * DUPLICATION OF EVENTS
     *
     * The event version is older or equal to the database entry. It must be a dup event.
     */
    if (event.versionKey <= curr.versionKey) {
      return Decision.ACK;
    }

    /**
     * The event version is two or more steps ahead of the database entry.
     * We NO_ACK, to process the event later.
     */
    return Decision.NO_ACK;
  }
}
