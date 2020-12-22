import { Model, DataTypes, Sequelize } from 'sequelize';

export class TableReplica extends Model {
  public id!: number;
  public data: any;
  public subject!: string;
  public sent!: boolean;
  public dataValues: any;
}

export const initTableReplica = (sequelize: Sequelize) => {
  TableReplica.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      age: {
        allowNull: true,
        type: DataTypes.NUMBER,
      },
      versionKey: {
        allowNull: false,
        type: DataTypes.NUMBER,
      },
    },
    {
      tableName: 'TableReplicas',
      sequelize,
      paranoid: true,
    },
  );
};
