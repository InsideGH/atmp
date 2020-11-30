import { Model, DataTypes, Sequelize } from 'sequelize';

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
export class Device extends Model {
  public id!: number;
  public type!: string;
  public versionKey!: number;
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
