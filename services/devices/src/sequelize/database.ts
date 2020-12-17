import { Sequelize } from 'sequelize';

export class Database {
  public sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize(process.env.DEVICES_DB_NAME!, process.env.DEVICES_DB_USER!, process.env.DEVICES_DB_USER_PASSWORD!, {
      host: 'devices-db-srv',
      dialect: 'postgres',
      dialectOptions: {
        timezone: process.env.DEVICES_DB_TIMEZONE,
      },
      define: {
        timestamps: true,
      },
      logging: false,
    });
  }

  async connect() {
    await this.sequelize.authenticate();
  }

  async disconnect() {
    await this.sequelize.close();
  }
}

export default new Database();
