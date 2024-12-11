import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private userSocketMap = new Map<string, string>();
  private socketUserMap = new Map<string, string>();
  private groupUsers = new Map<string, Set<string>>();

  addUser(userId: string, socketId: string) {
    this.userSocketMap.set(userId, socketId);
    this.socketUserMap.set(socketId, userId);
  }

  removeUser(socketId: string) {
    const userId = this.socketUserMap.get(socketId);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(socketId);
    }
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userSocketMap.get(userId);
  }

  addUserToGroup(userId: string, groupId: string) {
    if (!this.groupUsers.has(groupId)) {
      this.groupUsers.set(groupId, new Set());
    }
    this.groupUsers.get(groupId).add(userId);
  }

  removeUserFromGroup(userId: string, groupId: string) {
    const group = this.groupUsers.get(groupId);
    if (group) {
      group.delete(userId);
    }
  }

  isUserInGroup(userId: string, groupId: string): boolean {
    const group = this.groupUsers.get(groupId);
    return group ? group.has(userId) : false;
  }

  createGroup(): string {
    const groupId = uuidv4();
    this.groupUsers.set(groupId, new Set());
    return groupId;
  }
}
