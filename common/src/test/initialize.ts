import { Database } from './sqlite-memory-db';
import { modelInits as eventPersistorInits } from '../events-persistor/sequelize/models';
import { modelInits as recordPersistorInits } from '../record-persistor/sequelize/models';
import { modelInits as tableReplicaInits } from './models';

export const initialize = async (db: Database) => {
  [...eventPersistorInits, ...recordPersistorInits, ...tableReplicaInits].forEach((modelInit) => modelInit(db.sequelize));
  await db.sequelize.sync({ force: true });
};
