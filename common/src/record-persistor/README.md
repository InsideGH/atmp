# RecordPersistor

Most likely there is a need in all microservices to keep a journal/record of all the activities that is happening.

It can be anything that can fit into the structure

```javascript
      msg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
```

There might be things happening that is NOT sending any general events. One example could be microservice internal things that are not shared with the rest of the system, thus not triggering any events.

To have records of the activities, you can use this RecordPersistor feature.

## What does it support

It supports creating the record within a transaction. It optionally provides possibility to publish a event with JUST the ID and the name if the service.


## How to use it?

In one file: 

```javascript
    export class PatientRecord extends RecordPersistor {
    protected service: Services = Services.patients;
    }
```

In many places (most likely in the API route handlers)

```javascript
      const record = await new PatientRecord(
        natsWrapper.client,
        'Patient created',
        patient,
      ).createDbEntry(transaction);

      await transaction.commit();

      // optional
      record.publishId();
```
