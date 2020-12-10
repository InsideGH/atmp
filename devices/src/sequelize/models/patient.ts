import { Model, DataTypes, Sequelize, Transaction } from 'sequelize';
import { Device } from './device';

declare function addDevice(device: Device, options: { transaction: Transaction }): Promise<any>;
declare function getDevices(options: { transaction: Transaction }): Promise<Device>;
declare function hasDevice(device: Device, options: { transaction: Transaction }): Promise<Boolean>;
declare function removeDevice(
  device: Device,
  options: { transaction: Transaction },
): Promise<Device>;

export class Patient extends Model {
  public id!: number;
  public name!: string;
  public versionKey!: number;
  public addDevice!: typeof addDevice;
  public getDevices!: typeof getDevices;
  public hasDevice!: typeof hasDevice;
  public removeDevice!: typeof removeDevice;
  public dataValues: any;
}

export const initPatient = (sequelize: Sequelize) => {
  Patient.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      versionKey: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: 'Patients',
      sequelize,
      paranoid: true,
    },
  );
};
