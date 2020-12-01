import { Database } from './database';
import { createModelAssociations } from '../associations';
import { modelInits } from '../models/';

export const initialize = async (db: Database) => {
  /**
   * It's required that the associations are configured BEFORE the sync.
   */
  modelInits.forEach((modelInit) => modelInit(db.sequelize));
  createModelAssociations();
  await db.sequelize.sync({ force: true });
};
