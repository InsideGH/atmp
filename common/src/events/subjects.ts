/**
 * These are the available subjects that an event can have.
 */
export enum Subjects {
  ErrorCreated = 'error.created',

  /**
   * This one is duplicated in the services/system-web/src/components/events.js
   *
   * That service (frontend) is not speaking typescript.
   */
  LogCreated = 'log.created',

  PatientCreated = 'patient.created',
  PatientUpdated = 'patient.updated',
  PatientDeleted = 'patient.deleted',

  DeviceCreated = 'device.created',
  DeviceUpdated = 'device.updated',
  DeviceDeleted = 'device.deleted',
}
