import { Message, Stan, SubscriptionOptions } from 'node-nats-streaming';

/**
 * Common nats constants.
 */
export const natsConstants = {
  ackWait: 2 * 1000,
};

/**
 * This combination will replay all events that has not been received and
 * ack:ed by any worker in the queue group.
 *
 * The ack mode is manual.
 */
export function getNatsSubscriptionOptions(
  client: Stan,
  config: { ackWait: number; queueGroupName: string },
): SubscriptionOptions {
  return client
    .subscriptionOptions()
    .setDeliverAllAvailable()
    .setManualAckMode(true)
    .setAckWait(config.ackWait)
    .setDurableName(config.queueGroupName);
}

/**
 * Parse nats messages.
 */
export function parseNatsMessage(msg: Message) {
  const data = msg.getData();
  return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
}
