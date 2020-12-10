export enum Decision {
  UPDATE_AND_ACK,
  ACK,
  NO_ACK,
}

export class EventListenerLogic {
  static decision(event: { versionKey: number }, curr: { versionKey: number } | null): Decision {
    if (!curr) {
      return Decision.NO_ACK;
    }

    if (event.versionKey <= curr.versionKey) {
      return Decision.ACK;
    }

    if (event.versionKey - curr.versionKey == 1) {
      return Decision.UPDATE_AND_ACK;
    }

    return Decision.NO_ACK;
  }
}
