import db from '../database';
import { Model, DataTypes, ModelCtor } from 'sequelize';
import { Models } from '../models';

interface PatientInstance extends Model {
  id: number;
  name: string;
  versionKey: number;
}

export interface PatientInterface extends ModelCtor<PatientInstance> {
  associate(models: Models): void;
}

const Patient = <PatientInterface>db.sequelize.define<PatientInstance>(
  'Patient',
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
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

Patient.associate = (models) => {
  Patient.hasMany(models.Event);
};

export default Patient;
