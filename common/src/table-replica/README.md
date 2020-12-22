# Table replica

This feature exists for just ONE reason, which is to help with data replication between microservices

## Whats the deal?

When replicting data from microservice A to microservice B a couple of things can complicate it.

- A service, doesn't care that B service want's to replica the data.
- B service is not allowed to request the data from A service.

Thus, A service publishes events instead. The events can be (and most likely are) of type create/update/delete.

Using nats as the event bus provider it would have been possible to guarantee strict order at the receiving listener if we configure nats to only have one event inflight at a time AND only allow one listerner.

But instead we want to be able to have many events inflight and have many listerners (kubenernetes replicas) processing the events.

Therefor, a versionKey is used to keep track of the order.

Out of order can happen in many ways:

1. The receiving listener crashes while processing the event, which leads to nats timeout, and the event is republished after a while. Other events might have been received by other workers meanwhile.

2. The receiving group of workers are autoscaling up or down.

3. Having many replicas (kubernetes pods) of the updating service processing "concurrent" updates will lead to
   out of order events which are impossible to get around.

4. Handling multiple "concurrent" update request and persisting data into the database, most likely under transaction, we do not want to await network related things. Thus the events can leave out of order.

5. Network latencies

With the versionKey, being part in the event data, the listener can either accept the event and ack the message, or deny the event (because the versionKey is out of order). Denying will result on redelivery of the event later (configurable ackWait time).

Besides handling and denying, there is a third thing that must be handled are well, which is duplication of events. Duplication of events could happen if the publisher can't handle "concurrent" request in a correct way, which leads to event being published with the same versionKey. Another reason is that the `Event persistor` does not guarantee duplication free.

Using the `Table replica` feature, these things are hidden from you.

The only thing you need to do is to implement 3 things related to create/update/delete.

When you create your listerner you provide generics about the event that you are listening for `PatientCreatedEvent` and the Sequelize database model `Patient` to be used for database replication.

```javascript
class PatientCreatedListener extends ReplicaCreatedListener<PatientCreatedEvent, Patient>

...
  mapCreateCols(data: PatientCreatedEvent['data']) {
    return {
      id: data.id,
      name: data.name,
      versionKey: data.versionKey,
    };
  }
...

```

```javascript
class PatientUpdatedListener extends ReplicaUpdatedListener<PatientUpdatedEvent, Patient>

...
  mapUpdateCols(data: PatientUpdatedEvent['data']) {
    return {
      versionKey: data.versionKey,
      name: data.name,
      age: data.age,
    };
  }
...

```

```javascript
class PatientDeletedListener extends ReplicaDeletedListener<PatientDeletedEvent, Patient>
```

In your implementation for the create/update you also provide a function where you can map event data to database columns.

Besides the above you can implement a `onTransaction` method to be notified that a create or update is ongoing. Here you can hook into the ongoing transaction if you want. If you throw for example, the transaction will ofcourse rollback, but most importantly the event will be be resent in the future.