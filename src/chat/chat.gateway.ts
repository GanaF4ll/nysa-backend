import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatGuard } from './chat.guard';
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  @UseGuards(ChatGuard)
  handleConnection(client: Socket) {
    const user = client.data.user; // User data is now attached by the guard
    this.logger.log(`New user connected: ${client.id}, user: ${user.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`User ${client.data.user.id} joined room: ${room}`);
    client.emit('joinedRoom', room);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`User ${client.data.user.id} left room: ${room}`);
    client.emit('leftRoom', room);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('sendMessageToRoom')
  handleMessageToRoom(
    client: Socket,
    { room, message }: { room: string; message: string },
  ) {
    this.logger.log(`Message to room ${room}: ${message}`);
    this.server
      .to(room)
      .emit('newMessage', { message, sender: client.data.user.id });
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    client: Socket,
    { recipientId, message }: { recipientId: string; message: string },
  ) {
    const room = this.getPrivateRoomName(client.data.user.id, recipientId);
    this.logger.log(
      `Private message from ${client.data.user.id} to ${recipientId}: ${message}`,
    );
    this.server
      .to(room)
      .emit('newPrivateMessage', { message, sender: client.data.user.id });
  }

  private getPrivateRoomName(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `private-${sortedIds[0]}-${sortedIds[1]}`;
  }
}
