import { RecordPersistor, Services } from '@thelarsson/acss-common';

export class PatientRecord extends RecordPersistor {
  protected service: Services = Services.patients;
}
