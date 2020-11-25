import { Sequelize } from 'sequelize';

export class Database {
  public sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(
      process.env.PATIENTS_DB_NAME!,
      process.env.PATIENTS_DB_USER!,
      process.env.PATIENTS_DB_USER_PASSWORD!,
      {
        host: 'patients-db-srv',
        dialect: 'postgres',
        dialectOptions: {
          timezone: process.env.PATIENTS_DB_TIMEZONE,
        },
        define: {
          timestamps: true,
        },
        logging: false,
      },
    );
  }

  async connect() {
    await this.sequelize.authenticate();
  }

  async disconnect() {
    await this.sequelize.close();
  }
}

export default new Database();
