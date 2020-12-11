NextJS based frontend to monitor events and records in the various microservices.

The events are fetched from the backend system service.

The status of nats is read from nats monitoring API and colorizes the events in green, orange, red.

The records in the various microservices are fetched from the individual microservices.

It uses socket.io to live update whenever an event is received (including record events).

However, bouncing events to the microservices will not trigger socket.io updates, thus the need for manual refetch in those cases.
