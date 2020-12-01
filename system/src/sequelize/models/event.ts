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
export class Event extends Model {
  public id!: number;
  public subject!: string;
  public data!: any;
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
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSONB,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'Events',
      sequelize,
      paranoid: true,
    },
  );
};
