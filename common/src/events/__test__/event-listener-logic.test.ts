import { Decision, EventListenerLogic } from '../event-listener-logic';

it('return NO_ACK when curr does not exist', () => {
  const event = {
    versionKey: 1,
  };
  const curr = null;

  const decision = EventListenerLogic.decision(event, curr);
  expect(decision).toEqual(Decision.NO_ACK);
});

it('return NO_ACK when curr version is much older than event version', () => {
  const event = {
    versionKey: 6,
  };
  const curr = {
    versionKey: 1,
  };

  const decision = EventListenerLogic.decision(event, curr);
  expect(decision).toEqual(Decision.NO_ACK);
});

it('return ACK when event version is older or same as current', () => {
  const event = {
    versionKey: 9,
  };
  const curr = {
    versionKey: 10,
  };

  const decision = EventListenerLogic.decision(event, curr);
  expect(decision).toEqual(Decision.ACK);
});

it('return ACK when event version is older or same as current', () => {
  const event = {
    versionKey: 10,
  };
  const curr = {
    versionKey: 10,
  };

  const decision = EventListenerLogic.decision(event, curr);
  expect(decision).toEqual(Decision.ACK);
});

it('return HANDLE_AND_ACK when event version is 1 step ahead of current version', () => {
  const event = {
    versionKey: 11,
  };
  const curr = {
    versionKey: 10,
  };

  const decision = EventListenerLogic.decision(event, curr);
  expect(decision).toEqual(Decision.HANDLE_AND_ACK);
});
