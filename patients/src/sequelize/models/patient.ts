import db from '../database';
import { Model, DataTypes } from 'sequelize';

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
class Patient extends Model {
  public id!: number;
  public name!: string;
  public versionKey!: number;
  public dataValues: any;
}

Patient.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    versionKey: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: 'Patients',
    sequelize: db.sequelize,
    paranoid: true,
  },
);

export default Patient;
