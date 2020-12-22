import { BaseEvent } from '../../events/base/base-event';
import { Listener } from '../../events/base/base-listener';
import { logger } from '../../logger/pino';
import { Model, Sequelize, Transaction } from 'sequelize';
import { Message, Stan } from 'node-nats-streaming';

/**
 * A nats listener that is used as a base class. This will create a new entry in the database (CREATE).
 *
 * 2 methods must be provided by the implementor + 1 optional,
 *
 * required:
 *   onTransaction
 *   mapCreateCols
 *
 * optional:
 *   infoIgnored
 *
 */
export abstract class ReplicaCreatedListener<T extends BaseEvent, TM extends Model> extends Listener<T> {
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
  infoIgnored?(data: T['data'], row: any): void;

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
        if (this.infoIgnored) {
          this.infoIgnored(data, row);
        }
        await transaction.rollback();
      }

      msg.ack();
    } catch (error) {
      logger.error(error, `ReplicaCreatedListener error data.id=${data.id} subject=${msg.getSubject()}`);
      await transaction.rollback();
      throw error;
    }

    return;
  }
}
