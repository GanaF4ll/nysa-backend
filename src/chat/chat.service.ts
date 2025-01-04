import { Injectable } from '@nestjs/common';
import { Message_type } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(public prismaService: PrismaService) {}

  private userSocketMap = new Map<string, string>();
  private socketUserMap = new Map<string, string>();
  private groupUsers = new Map<string, Set<string>>();

  addUser(user_id: string, socket_id: string) {
    this.userSocketMap.set(user_id, socket_id);
    this.socketUserMap.set(socket_id, user_id);
  }

  removeUser(socket_id: string) {
    const user_id = this.socketUserMap.get(socket_id);
    if (user_id) {
      this.userSocketMap.delete(user_id);
      this.socketUserMap.delete(socket_id);
    }
  }

  getUserSocketId(user_id: string): string | undefined {
    return this.userSocketMap.get(user_id);
  }

  addUserToGroup(user_id: string, group_id: string) {
    if (!this.groupUsers.has(group_id)) {
      this.groupUsers.set(group_id, new Set());
    }
    this.groupUsers.get(group_id).add(user_id);
  }

  removeUserFromGroup(user_id: string, group_id: string) {
    const group = this.groupUsers.get(group_id);
    if (group) {
      group.delete(user_id);
    }
  }

  isUserInGroup(user_id: string, group_id: string): boolean {
    const group = this.groupUsers.get(group_id);
    return group ? group.has(user_id) : false;
  }

  async createGroup(name: string, is_private: boolean): Promise<string> {
    const group_id = uuidv4();
    this.groupUsers.set(group_id, new Set());
    await this.prismaService.conversation.create({
      data: {
        id: group_id,
        name,
        is_private,
      },
    });
    return group_id;
  }

  async createMessage(
    sender_id: string,
    recipient_id: string,
    content: string,
    conversation_id: string,
    type: Message_type,
  ) {
    return this.prismaService.message.create({
      data: {
        conversation: {
          connect: { id: conversation_id },
        },
        sender: {
          connect: { id: sender_id },
        },
        content,
        status: 'SENT',
        type,
      },
    });
  }

  async createGroupMessage(
    sender_id: string,
    group_id: string,
    content: string,
    type: Message_type,
  ) {
    const conversationExists = await this.prismaService.conversation.findUnique(
      {
        where: { id: group_id },
      },
    );

    if (!conversationExists) {
      throw new Error(`Conversation with id ${group_id} not found`);
    }

    return this.prismaService.message.create({
      data: {
        conversation: {
          connect: { id: group_id },
        },
        sender: {
          connect: { id: sender_id },
        },
        content,
        status: 'SENT',
        type,
      },
    });
  }
}
