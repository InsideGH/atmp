import db from '../database';
import { Model, DataTypes, ModelCtor } from 'sequelize';
import { Models } from '../models';

interface AlarmInstance extends Model {
  id: number;
  hwId: string;
  state: string;
  versionKey: number;
  addEvent(event: any, config?: any): Promise<any>;
}

export interface AlarmInterface extends ModelCtor<AlarmInstance> {
  associate(models: Models): void;
}

const Alarm = <AlarmInterface>db.sequelize.define<AlarmInstance>(
  'Alarm',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    hwId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    versionKey: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  },
  {
    paranoid: true,
  },
);

Alarm.associate = (models) => {
  Alarm.hasMany(models.Event);
};

export default Alarm;
