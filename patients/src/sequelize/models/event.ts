import db from '../database';
import { Model, DataTypes, ModelCtor } from 'sequelize';
import { Models } from '../models';

interface EventInstance extends Model {
  [x: string]: any;
  id: string;
  data: any;
  versionKey: number;
  sent: boolean;
  setPatient(patient: any, config?: any): Promise<any>;
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
    versionKey: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    sent: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
  },
  {
    paranoid: true,
  },
);

Event.associate = (models) => {
  Event.belongsTo(models.Patient);
};

export default Event;
