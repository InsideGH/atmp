import { Sequelize } from 'sequelize';

export class Database {
  public sequelize: Sequelize;

  constructor() {
    this.sequelize = new Sequelize('postgres', 'postgres', '1', {
      host: '127.0.0.1',
      dialect: 'postgres',
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
