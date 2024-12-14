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

  addUserToGroup(userId: string, group_id: string) {
    if (!this.groupUsers.has(group_id)) {
      this.groupUsers.set(group_id, new Set());
    }
    this.groupUsers.get(group_id).add(userId);
  }

  removeUserFromGroup(userId: string, group_id: string) {
    const group = this.groupUsers.get(group_id);
    if (group) {
      group.delete(userId);
    }
  }

  isUserInGroup(userId: string, group_id: string): boolean {
    const group = this.groupUsers.get(group_id);
    return group ? group.has(userId) : false;
  }

  createGroup(): string {
    const group_id = uuidv4();
    this.groupUsers.set(group_id, new Set());
    return group_id;
  }
}
