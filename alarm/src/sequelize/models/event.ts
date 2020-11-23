import db from '../database';
import { Model, DataTypes, ModelCtor } from 'sequelize';
import { Models } from '../models';

interface EventInstance extends Model {
  [x: string]: any;
  id: number;
  data: any;
  versionKey: number;
  setAlarm(alarm: any, config?: any): Promise<any>;
}

export interface EventInterface extends ModelCtor<EventInstance> {
  associate(models: Models): void;
}

const Event = <EventInterface>db.sequelize.define<EventInstance>(
  'Event',
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
    sent: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
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

Event.associate = (models) => {
  Event.belongsTo(models.Alarm);
};

export default Event;
