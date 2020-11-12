import { Sequelize } from 'sequelize';

export class Database {
  public sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(
      process.env.ALARM_DB_NAME!,
      process.env.ALARM_DB_USER!,
      process.env.ALARM_DB_USER_PASSWORD!,
      {
        host: 'alarm-db-srv',
        dialect: 'mariadb',
        dialectOptions: {
          timezone: process.env.ALARM_DB_TIMEZONE,
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
