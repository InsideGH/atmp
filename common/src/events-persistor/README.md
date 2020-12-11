# Event persistor

This feature exists for just ONE reason, which is to handle the case when nats itself is down.

## Should the request fail IF nats is down? 

No, the request has probably been handled by the receiving microservice in the correct way, the only thing failing is that the event can be sent. 

## Should we do await in our request handlers?

Depends. If we are in a database transaction, we do not want to do syncronous network request. The risk is that our transaction could take long time for various reasons. We only have 5 transactions available by default in postgres.

## How do we know that our event has been published to nats?

We can await the publishing of our event.

## Do we want to await our event publish?

Do we want to bend our rule about awaiting network calls in out request handlers?

Lets say, that we await the publishing. The only reason to do this is to be able to respond back to the client that we failed (with the risk of blocking transactions). In a sense this is strange because is similar to sync based communication where an incoming req would fail if any subsequent sync req fails.

## How would we publish events without the event persistor?

Normally, you would publish a event using the base publisher class which is generic based. It makes sure that your publisher confirms with the event structure. Same goes for any listeners.

## How to use the event persistor?

With the event persistor, you create a internal publisher, which also is generic based. This means that typescript will typesafe your event structure.

Using the internal publisher instance, you can do two things.

1) Within the ongoing database transaction, store the nats event in the microservice local database.
2) After the transaction has been commited, you can use the same internal publisher instance to send the event to nats (without await)

## How does the event persistor solve this nats down issue (if it ever will happen?)

When step one is performed, it saves the event (subject and data) + if the event has been sent 
or not in the database.

When step two is performed, an internal event (EventEmitter) will trigger publishing of the event in the database (by ID). The entry in the database is read. If 'sent' is false, it does an
AWAIT publish. NOTE that we are NOT using a database transaction here. If the await succeeds, we 
update the 'sent' field in the database. We are done.

If for some reason, nats is down at this stage, the publishing await would after 20-30 seconds, timeout and throw an error. The 'sent' flag will not be updated. The event has not been sent.

Depending on how the microservice is configured to handle nats lost connections (right now it will kill it self and kubernetes will restart the microservice) and the event persistor is configure multiple things can happen.

The event persistor can be configured to run a periodic cron job. The job basically finds all non sent events in the database, and tries to send them as described above.

## Drawbacks of the event persistor

Depending on how it's configured, that is how often it will trigger the cron job it could result in event duplication.

Event duplication is handled by the versionKey principle though.

## Example

```javascript
      const internalPublisher = eventPersistor.getPublisher<PatientCreatedEvent>({
        subject: Subjects.PatientCreated,
        data: {
          id: patient.id,
          name: patient.name,
          versionKey: patient.versionKey,
        },
      });

      await internalPublisher.createDbEntry(transaction);
      await transaction.commit();

      internalPublisher.publish();
```