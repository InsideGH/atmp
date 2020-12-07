import { Model, DataTypes, Sequelize } from 'sequelize';

export class Log extends Model {
  public id!: number;
  public msg!: string;
  public data: any;
}

export const initLog = (sequelize: Sequelize) => {
  Log.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      msg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: 'Logs',
      sequelize,
      paranoid: true,
    },
  );
};
