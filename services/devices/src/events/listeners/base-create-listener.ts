import { BaseEvent, Listener, logger } from '@thelarsson/acss-common';
import { Model, Sequelize, Transaction } from 'sequelize';
import { Message, Stan } from 'node-nats-streaming';

export abstract class ReplicaCreateListener<T extends BaseEvent, TM extends Model> extends Listener<T> {
  /**
   * The created replica is provided UNDER ONGOING TRANSACTION. No need to commit or
   * rollback transaction, we will handle that.
   *
   * @param data Event data
   * @param row The database instance
   * @param transaction Ongoing sequalize transaction
   */
  abstract onTransaction(data: T['data'], row: TM, transaction: Transaction): Promise<void>;

  /**
   * The event data should be used to map it to database base column structure.
   *
   * @param data Event data
   */
  abstract mapCreateCols(data: T['data']): any;

  /**
   * Information that the event has been ignored due to that the entry already existed in the database.
   *
   * @param data Event data
   * @param row Database row
   */
  abstract infoIgnored(data: T['data'], row: any): void;

  /**
   * Using <<<<< ANY >>>>> for the sequelize static model here...can't get typescript work with Sequelize, passing model as argument...it's just a pain...
   */
  constructor(client: Stan, config: { enableDebugLogs: false }, private sequelize: Sequelize, private SequelizeModel: any) {
    super(client, config);
  }

  async onMessage(data: T['data'], msg: Message): Promise<void> {
    const transaction = await this.sequelize.transaction();

    try {
      const [row, created] = await this.SequelizeModel.findOrCreate({
        where: {
          id: data.id,
        },
        defaults: this.mapCreateCols(data),
        paranoid: false,
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (created) {
        await this.onTransaction(data, row, transaction);
        await transaction.commit();
      } else {
        this.infoIgnored(data, row);
        await transaction.rollback();
      }

      msg.ack();
    } catch (error) {
      logger.error(error, `ReplicaCreateListener error data.id=${data.id} subject=${msg.getSubject()}`);
      await transaction.rollback();
    }

    return;
  }
}
