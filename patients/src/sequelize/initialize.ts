import { Database } from './database';
import { createModelAssociations } from './associations';
import { modelInits } from './models/';

export const initialize = async (db: Database) => {
  modelInits.forEach((modelInit) => modelInit(db.sequelize));
  createModelAssociations();
  await db.sequelize.sync({ force: false });
};
