import { DbLog } from '../db-log/sequelize/db-log';
import { Services } from '@thelarsson/acss-common';

export class PatientDbLog extends DbLog {
  protected service: Services = Services.patients;
}
