import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatGuard } from './chat.guard';

@WebSocketGateway({ namespace: '/', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  @UseGuards(ChatGuard)
  handleConnection(client: Socket) {
    const user = client.data.user; // User data is now attached by the guard
    if (!user || !user.id) {
      this.logger.error('User data is not attached or user id is missing');
      client.disconnect(); // Optionally disconnect the client
      return;
    }
    this.logger.log(`New user connected: ${client.id}, user: ${user.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    const user = client.data.user;
    client.join(room);
    this.logger.log(`User ${user.id} joined room: ${room}`);
    client.emit('joinedRoom', room);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    const user = client.data.user;
    client.leave(room);
    this.logger.log(`User ${user.id} left room: ${room}`);
    client.emit('leftRoom', room);
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('sendMessageToRoom')
  handleMessageToRoom(
    client: Socket,
    { room, message }: { room: string; message: string },
  ) {
    const user = client.data.user;
    this.logger.log(`Message to room ${room} from ${user.id}: ${message}`);
    this.server.to(room).emit('newMessage', { message, sender: user.id });
  }

  @UseGuards(ChatGuard)
  @SubscribeMessage('privateMessage')
  handlePrivateMessage(
    client: Socket,
    { recipientId, message }: { recipientId: string; message: string },
  ) {
    const user = client.data.user;
    const room = this.getPrivateRoomName(user.id, recipientId);
    this.logger.log(
      `Private message from ${user.id} to ${recipientId}: ${message}`,
    );
    this.server
      .to(room)
      .emit('newPrivateMessage', { message, sender: user.id });
  }

  private getPrivateRoomName(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `private-${sortedIds[0]}-${sortedIds[1]}`;
  }
}
