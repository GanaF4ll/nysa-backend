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
    const user_id = client.handshake.query.user_id as string;
    if (user_id) {
      this.chatService.addUser(user_id, client.id);
      this.logger.log(`User connected: ${user_id}`);
      client.emit('connected', { status: 'connected', user_id });
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

    const conversation_id = await this.getOrCreateConversation(
      messageData.sender_id,
      messageData.recipient_id,
    );

    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('privateMessage', {
        from: messageData.sender_id,
        message: messageData.message,
        timestamp: new Date(),
        type: messageData.type,
      });

      await this.chatService.createMessage(
        messageData.sender_id,
        messageData.recipient_id,
        messageData.message,
        conversation_id,
        messageData.type,
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
      joinGroupData.user_id,
      joinGroupData.group_id,
    );

    return { status: 'success', message: 'Joined group successfully' };
  }
  // TODO: service conversation create & add user to group
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
        type: messageData.type,
      });

      try {
        await this.chatService.createGroupMessage(
          messageData.sender_id,
          messageData.group_id,
          messageData.message,
          messageData.type,
        );
        return { status: 'success', message: 'Group message sent' };
      } catch (error) {
        this.logger.error(`Failed to create group message: ${error.message}`);
        return { status: 'error', message: 'Failed to create group message' };
      }
    }

    return { status: 'error', message: 'User not in group' };
  }

  private async getOrCreateConversation(
    sender_id: string,
    recipient_id: string,
  ): Promise<string> {
    const existingConversation =
      await this.chatService.prismaService.conversations.findFirst({
        where: {
          is_private: true,
          Conversation_member: {
            some: {
              user_id: sender_id,
            },
          },
          AND: {
            Conversation_member: {
              some: {
                user_id: recipient_id,
              },
            },
          },
        },
      });

    if (existingConversation) {
      return existingConversation.id;
    } else {
      const newConversation =
        await this.chatService.prismaService.conversations.create({
          data: {
            name: `Conversation between ${sender_id} and ${recipient_id}`,
            is_private: true,
            Conversation_member: {
              create: [{ user_id: sender_id }, { user_id: recipient_id }],
            },
          },
        });
      return newConversation.id;
    }
  }
}
