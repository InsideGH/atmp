import { Database } from './database';
import { modelInits } from '../internal-events/sequelize/models';

export const initialize = async (db: Database) => {
  modelInits.forEach((modelInit) => modelInit(db.sequelize));
  await db.sequelize.sync({ force: true });
};
