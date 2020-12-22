# Panda care

Panda care project.

# Commands

## First time

- `make install`
- `make check` (builds, lints and tests)
- `make minikube`

> then

- `minikube ip` gives you the IP, for example `192.168.49.2`.
- put this into your /etc/hosts file
  - `192.168.49.2 system.acss.dev admin.acss.dev`

---

## Start dev env

- `make minikube` (only if you don't have minikube running)
- `make dev`

## Stop dev env

- To stop, press `CTRL-C` and wait for skaffold to finish cleaning up.

---

## Check the code (build Typescipt, lint, test)

- `make check`

---

## Delete the minikube cluster

- `make minikube_delete`

---

## Push common and update all package.jsons with new version

- `make common`

## Sometimes npm is slow to reflect updates

- `make bump_all`

---

## Add prometheus and grafana

- `make loki-grafana`

## Expose grafana on localhost:3000

- `make grafana`

---

## Start prod env locally

- `make prod`

## Stop prod env locally

- `make prod_stop`

## Get all cluster logs in terminal (or use grafana)

- `make logs`

---

## Build all images

- `make images`

## Push all images

- `make push`

---

## Stress system (cluster)

- `make stress`

# The system and "rules (suggestions)"

> **The system is using typescript.**

Try try try to not use `any`, which basically turns off typescript. It's really annoying to hassle with typescript problems and it's very tempting to use `any` (especially as a beginner). But for us to really utilize typescript we must put the extra time into it and just then we can benefit of it. If we use `any` in many places, there is not point in having typescript.

> **Each microservice (MS) is completely isolated from other MS's.**

This means that each MS has it's own database (if it needs one). A MS does not make any requests to other MS.

This means that the features provided by a MS will be available even if every other MS in the system is down.

This means that it's not allowed to make syncronous HTTP requests to fetch stuff from another MS. If data is needed from another MS, the data must be replicated to the needed MS.

Replication is done using the event stream bus.

> **Each microservice must be tested.**

If the MS has an exposed API, the API must be tested using `supertest` and `jest`. If the MS has event listeners, the code executed when a event is handled must be tested with `jest`.

> **Every MS must return errors to clients in the same way/structure.**

The structure to be used is found in the common module in the form of a express middleware.

Along with the middleware which catches errors, there is a collection of errors that can be used for throwing. You can make new ones, by using/extending the `custom-errors.ts`. All errors are extensions of the native `Error` class.

> **Every MS must obey the rules of events and subjects.**

Since every MS in the system most likely will publish and/or listen to events it's important that the structure and subjects of events are described (typescript). Having the events and available subjects described, we can utilize typescript to typecheck our publishers and listeners. This prevents us from accidentially publish wrong data into the event system and thus affecting all other MS's.

This means that whenever we make a change in a event for example, we trust that typescipt will detect fail and tell us what parts we need to update.

This means that each event that is sent must be described (extension of the `BaseEvent`). It's part of the common library. When you have created a new event, you must export it from common. Now, all listeners in the system can listen for the event that you just created and they all know exactly what kind of data and structure to expect.

This means that when you some day change your event structure, the group of developers that are responsible for their MS will detect the change and can act accordinly.

Besides the `BaseEvent`, there is a (Base )`Listener` and (Base)`Publisher` that can be used to create publishers and listeners. Using these makes sure that only valid events can enter the system.

> **Other common functionality**

Code that is generally duplicated in each MS should be moved into the common module. Each functionality in the common module must be tested.

- **Features that are provided by the common module**

  - `Event persistor` [link to its README](./common/src/events-persistor/README.md)
  - `Record persistor` [link to its README](./common/src/record-persistor/README.md)
  - `Table replica` [link to its README](./common/src/table-replica/README.md)
  - `EventListenerLogic`, a helper class if you wan't to handle versionKey stuff yourself.
  - `Nats config`, some nats configurations that can be used by all microservices.
  - `Sequelize queries`, some sequelize queries collections handling table order, limit, offset and filtering.
  - `Misc`, some small utility functions.
  - `Logger`, based on Pino. In production, it logs in json and during development, the logs are piped through pretty-print.

# A single microservice folder structure

`src/events`

- has the listeners and publishers (if not using `EventPersistor`).

`record`

- `RecordPersistor` config.

`routes`

- All the various API routes.

`sequelize`

- Database and models.

`test`

- Contains test setup for jest and mocks.

`app.ts`

- This is the express app.

`index.ts`

- This is the entry point.
