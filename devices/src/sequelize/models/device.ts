import { Model, DataTypes, Sequelize, Transaction } from 'sequelize';
import { Patient } from './patient';

/**
 * Here we define some attributes on the Sequelize model that we want to be available for us
 * in typescript world.
 *
 * Note, this only applies to "read" mode, i.e when working with an instance.
 *
 * It does not prevent us from creating something that is not according to model spec.
 *
 * For that we must have much mode magic code according to sequalize homepage.
 */

/**
 * Declare the association, this will make us never forget the transaction in second argument.
 */
declare function setPatient(x: Patient | null, options: { transaction: Transaction }): Promise<any>;
declare function getPatient(options: { transaction: Transaction }): Promise<Patient>;

export class Device extends Model {
  public id!: number;
  public type!: string;
  public versionKey!: number;
  public setPatient!: typeof setPatient;
  public getPatient!: typeof getPatient;
  public PatientId!: number;
  public Patient!: Patient;
  public dataValues: any;
}

export const initDevice = (sequelize: Sequelize) => {
  Device.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      versionKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'Devices',
      sequelize,
      paranoid: true,
    },
  );
};
