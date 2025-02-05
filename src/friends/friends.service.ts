import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { PrismaService } from 'src/db/prisma.service';
import { Invitation_status } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createFriendDto: CreateFriendDto) {
    const { user_id1, user_id2 } = createFriendDto;
    const status = Invitation_status.PENDING;
    try {
      const user1 = await this.prismaService.users.findUnique({
        where: { id: user_id1 },
      });

      if (!user1) {
        throw new NotFoundException('User 1 not found');
      }

      const user2 = await this.prismaService.users.findUnique({
        where: { id: user_id2 },
      });

      if (!user2) {
        throw new NotFoundException('User 2 not found');
      }

      if (user1.id === user2.id) {
        throw new NotFoundException('You cannot be friends with yourself');
      }

      // Vérifiez si une relation existe déjà
      const existingFriendShip = await this.prismaService.friends.findFirst({
        where: {
          OR: [
            { user_id1, user_id2 },
            { user_id1: user_id2, user_id2: user_id1 },
          ],
        },
      });

      if (existingFriendShip) {
        if (existingFriendShip.status === Invitation_status.ACCEPTED) {
          throw new ConflictException('You are already friends');
        }

        if (existingFriendShip.status === Invitation_status.PENDING) {
          throw new ConflictException('Friendship request is already sent');
        }
      }

      // Crée la nouvelle requête
      const newRequest = await this.prismaService.friends.create({
        data: { user_id1, user_id2, status },
      });

      if (!newRequest) {
        throw new NotFoundException('Friend request failed');
      }

      return { message: 'Friend request sent' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
  // TODO: récurer que les invitations ou je suis responder
  async findAllMyInvitations(user_id: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const friendRequests = await this.prismaService.friends.findMany({
        where: {
          OR: [{ user_id1: user_id }, { user_id2: user_id }],
          status: Invitation_status.PENDING,
        },
      });

      if (!friendRequests || friendRequests.length === 0) {
        throw new NotFoundException('No friend requests found');
      }
      return { data: friendRequests };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllFriends(user_id: string) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const friendRequests = await this.prismaService.friends.findMany({
        where: {
          OR: [{ user_id1: user_id }, { user_id2: user_id }],
          status: Invitation_status.ACCEPTED,
        },
      });

      if (!friendRequests || friendRequests.length === 0) {
        throw new NotFoundException('No friend requests found');
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    return `This action returns a #${id} friend`;
  }

  // todo: update que les demandes où je suis responder
  async update(updateFriendDto: UpdateFriendDto) {
    const { user_id1, user_id2, status } = updateFriendDto;
    try {
      const friendRequest = await this.prismaService.friends.findFirst({
        where: {
          OR: [
            { user_id1, user_id2 },
            { user_id1: user_id2, user_id2: user_id1 },
          ],
        },
      });

      if (!friendRequest) {
        throw new NotFoundException('Friend request not found');
      }

      if (friendRequest.status === status) {
        throw new ConflictException('Friend request already in this status');
      }

      const updatedRequest = await this.prismaService.friends.update({
        where: {
          user_id1_user_id2: {
            user_id1: friendRequest.user_id1,
            user_id2: friendRequest.user_id2,
          },
        },
        data: { status },
      });

      if (!updatedRequest) {
        throw new NotFoundException('Friend request update failed');
      }

      return {
        message: `Friend request updated from ${friendRequest.status} to ${updatedRequest.status}`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
