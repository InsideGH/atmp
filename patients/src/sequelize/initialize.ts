import { Database } from './database';
import { createModelAssociations } from './associations';

export const initialize = async (db: Database) => {
  createModelAssociations();
  await db.sequelize.sync({ force: true });
};
