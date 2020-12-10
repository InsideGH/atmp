import { models } from './models/';

export const createModelAssociations = () => {
  models.Patient.hasMany(models.Device);
  models.Device.belongsTo(models.Patient);
};
