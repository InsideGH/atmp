import { Database } from './database';
import { createModelAssociations } from '../associations';

export const initialize = async (db: Database) => {
  /**
   * It's required that the associations are configured BEFORE the sync.
   */
  createModelAssociations();
  await db.sequelize.sync({ force: true });
};
