import { Database } from './sqlite-memory-db';
import { modelInits as eventPersistorInits } from '../events-persistor/sequelize/models';
import { modelInits as recordPersistorInits } from '../record/sequelize/models';

export const initialize = async (db: Database) => {
  [...eventPersistorInits, ...recordPersistorInits].forEach((modelInit) => modelInit(db.sequelize));
  await db.sequelize.sync({ force: true });
};
