import { Model, DataTypes, Sequelize } from 'sequelize';

export class Event extends Model {
  public id!: number;
  public data: any;
  public subject!: string;
  public sent!: boolean;
  public dataValues: any;
}

export const initEvent = (sequelize: Sequelize) => {
  Event.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      data: {
        type: DataTypes.JSONB,
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
      sequelize,
      paranoid: true,
    },
  );
};
