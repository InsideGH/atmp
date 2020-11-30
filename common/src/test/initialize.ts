import { Database } from './database';
import { modelInits } from '../events-persistor/sequelize/models';

export const initialize = async (db: Database) => {
  modelInits.forEach((modelInit) => modelInit(db.sequelize));
  await db.sequelize.sync({ force: true });
};
