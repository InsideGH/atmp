import { Model, DataTypes, Sequelize } from 'sequelize';

export class Record extends Model {
  public id!: number;
  public msg!: string;
  public data: any;
  public dataValues: any;
}

export const initRecord = (sequelize: Sequelize) => {
  Record.init(
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
        type: DataTypes.JSONB,
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
