import { Server, Socket } from 'socket.io';
import { logger } from '@thelarsson/acss-common';
import { SocketEventChannel } from './socket-event-channel';

export class SocketWrapper {
  private sockets: Socket[] = [];
  constructor(private ioServer: Server) {}

  private onMessage(socket: Socket, message: any) {
    logger.info(`socket-wrapper: onMessage ${message} from socket=${socket.id}`);
  }

  private onDisconnect(socket: Socket, reason: any) {
    logger.info(`socket-wrapper: onDisconnect ${reason} from socket=${socket.id}`);
    this.sockets = this.sockets.filter((x) => x.id != socket.id);
    logger.info(`socket-wrapper: ${this.sockets.length} connections`);
  }

  public start() {
    this.ioServer.on('connection', (socket: Socket) => {
      logger.info(`socket-wrapper: connection ${socket.id}`);

      this.sockets.push(socket);
      logger.info(`socket-wrapper: ${this.sockets.length} connections`);

      socket.on('message', (message: any) => this.onMessage(socket, message));
      socket.on('disconnect', (reason: any) => this.onDisconnect(socket, reason));
    });
  }

  public async close() {
    await new Promise<void>((resolve) => {
      this.ioServer.close(() => {
        resolve();
      });
    });
  }

  public broadcast(channel: SocketEventChannel, data: any) {
    this.ioServer.emit(channel, data);
  }
}
