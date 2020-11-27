import db from '../database';
import { Model, DataTypes } from 'sequelize';

export class Event extends Model {
  public id!: string;
  public data: any;
  public subject!: string;
  public sent!: boolean;
  public dataValues: any;
}

Event.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    subject: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    sent: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'Events',
    sequelize: db.sequelize,
    paranoid: true,
  },
);

export default Event;
