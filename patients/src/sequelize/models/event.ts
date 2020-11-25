import db from '../database';
import { Model, DataTypes, ModelCtor } from 'sequelize';
import { Models } from '../models';

export interface EventInstance extends Model {
  id: string;
  data: any;
  subject: string;
  sent: boolean;
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
    paranoid: true,
  },
);

Event.associate = (models) => {};

export default Event;
