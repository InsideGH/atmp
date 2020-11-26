import { Database } from './database';
import { models } from './models/';

export const initialize = async (db: Database) => {
  /**
   * It's required that the associations are configured BEFORE the sync.
   */
  Object.values(models).forEach((model) => model.associate(models));

  await db.sequelize.sync({ force: false });
};
