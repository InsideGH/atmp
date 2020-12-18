import { BaseEvent, Decision, EventListenerLogic, Listener, logger } from '@thelarsson/acss-common';
import { Model, Sequelize, Transaction } from 'sequelize';
import { Message, Stan } from 'node-nats-streaming';

export abstract class ReplicaDeletedListener<T extends BaseEvent, TM extends Model> extends Listener<T> {
  /**
   * The replica to be deleted is provided UNDER ONGOING TRANSACTION. No need to commit or
   * rollback transaction, we will handle that. The replica has NOT yet been destroyed
   * under the ongoing transaction, but will be after returning from this method.
   *
   * @param data Event data
   * @param row The database instance
   * @param transaction Ongoing sequalize transaction
   */
  abstract onTransaction(data: T['data'], row: TM, transaction: Transaction): Promise<void>;

  /**
   * Information that the event has been ignored due to that
   *
   * The event version is older or equal to the database entry. It must be a dup event.
   *
   * @param data Event data
   * @param row Database row
   */
  abstract infoIgnored(data: T['data'], row?: any): void;

  /**
   * Information that the event has been not been update due to that
   *
   * 1. Update event happens BEFORE create event.
   * 2. The event version is two or more steps ahead of the database entry.
   *
   * @param data Event data
   * @param row Database row
   */
  abstract infoNotThisTime(data: T['data'], row?: any): void;

  /**
   * Using <<<<< ANY >>>>> for the sequelize static model here...can't get typescript work with Sequelize, passing model as argument...it's just a pain...
   */
  constructor(client: Stan, config: { enableDebugLogs: false }, private sequelize: Sequelize, private SequelizeModel: any) {
    super(client, config);
  }

  async onMessage(data: T['data'], msg: Message): Promise<void> {
    const precheck = await EventListenerLogic.preDatabaseCheck(this.SequelizeModel, data);

    if (precheck == Decision.ACK) {
      msg.ack();
      this.infoIgnored(data);
      return;
    } else if (precheck == Decision.NO_ACK) {
      this.infoNotThisTime(data);
      return;
    }

    const transaction = await this.sequelize.transaction();

    try {
      const row = await this.SequelizeModel.findByPk(data.id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
        paranoid: false,
      });

      const decision = EventListenerLogic.decision(data, row);
      if (decision == Decision.HANDLE_AND_ACK) {
        if (row) {
          await this.onTransaction(data, row, transaction);
          await row.destroy({ transaction });
          await transaction.commit();
          msg.ack();
        } else {
          throw new Error(`not possible that row is undefined if decision is HANDLE_AND_ACK, data.id=${data.id} subject=${msg.getSubject()}`);
        }
      } else if (decision == Decision.NO_ACK) {
        this.infoNotThisTime(data, row);
        await transaction.rollback();
      } else {
        this.infoIgnored(data, row);
        msg.ack();
        await transaction.rollback();
      }
    } catch (error) {
      await transaction.rollback();
      logger.error(error, `ReplicaDeleteListener error data.id=${data.id} subject=${msg.getSubject()}`);
    }
    return;
  }
}
