import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PrivateMessageDto } from './dto/private-message.dto';
import { GroupMessageDto } from './dto/group-message.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.chatService.addUser(userId, client.id);
      this.logger.log(`User connected: ${userId}`);
      client.emit('connected', { status: 'connected', userId });
    }
  }

  handleDisconnect(client: Socket) {
    this.chatService.removeUser(client.id);
  }

  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageData: PrivateMessageDto,
  ) {
    this.logger.log(
      `Received privateMessage event: ${JSON.stringify(messageData)}`,
    );
    this.logger.log(`Sender ID: ${messageData.sender_id}`);
    this.logger.log(`Recipient ID: ${messageData.recipient_id}`);

    const recipientSocketId = this.chatService.getUserSocketId(
      messageData.recipient_id,
    );

    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('privateMessage', {
        from: messageData.sender_id,
        message: messageData.message,
        timestamp: new Date(),
      });
      this.logger.log(
        `Message sent from ${messageData.sender_id} to ${messageData.recipient_id}`,
      );

      return { status: 'success', message: 'Message sent' };
    }

    this.logger.log(`User not found or offline: ${messageData.recipient_id}`);
    return { status: 'error', message: 'User not found or offline' };
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() joinGroupData: JoinGroupDto,
  ) {
    client.join(joinGroupData.group_id);
    this.chatService.addUserToGroup(
      joinGroupData.userId,
      joinGroupData.group_id,
    );

    return { status: 'success', message: 'Joined group successfully' };
  }

  @SubscribeMessage('groupMessage')
  async handleGroupMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageData: GroupMessageDto,
  ) {
    if (
      this.chatService.isUserInGroup(
        messageData.sender_id,
        messageData.group_id,
      )
    ) {
      this.server.to(messageData.group_id).emit('groupMessage', {
        group_id: messageData.group_id,
        from: messageData.sender_id,
        message: messageData.message,
        timestamp: new Date(),
      });

      return { status: 'success', message: 'Group message sent' };
    }

    return { status: 'error', message: 'User not in group' };
  }
}
