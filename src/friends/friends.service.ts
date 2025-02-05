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
    const { sender_id, responder_id } = createFriendDto;
    const status = Invitation_status.PENDING;
    try {
      const sender = await this.prismaService.users.findUnique({
        where: { id: sender_id },
      });

      if (!sender) {
        throw new NotFoundException('User 1 not found');
      }

      const responder = await this.prismaService.users.findUnique({
        where: { id: responder_id },
      });

      if (!responder) {
        throw new NotFoundException('User 2 not found');
      }

      if (sender.id === responder.id) {
        throw new NotFoundException('You cannot be friends with yourself');
      }

      const existingFriendShip = await this.prismaService.friends.findFirst({
        where: {
          user_id1: sender_id,
          user_id2: responder_id,
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

      // * vérifie si le responder a déjà envoyé une demande
      const didResponderAlreadyRequest =
        await this.prismaService.friends.findFirst({
          where: {
            user_id1: responder_id,
            user_id2: sender_id,
          },
        });

      // * si oui et que la demande est en attente, accepter la demande
      if (didResponderAlreadyRequest.status === Invitation_status.PENDING) {
        await this.prismaService.friends.update({
          where: {
            user_id1_user_id2: {
              user_id1: didResponderAlreadyRequest.user_id1,
              user_id2: didResponderAlreadyRequest.user_id2,
            },
          },
          data: { status: Invitation_status.ACCEPTED },
        });

        return {
          message:
            'The existing friend request from the responder has been accepted',
        };
      }

      const newRequest = await this.prismaService.friends.create({
        data: { user_id1: sender_id, user_id2: responder_id, status },
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

      // récupère que les demande où je suis responder & pas encore répondu
      const friendRequests = await this.prismaService.friends.findMany({
        where: {
          user_id2: user_id,
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

  // todo: update que les demandes où je suis responder
  async update(updateFriendDto: UpdateFriendDto) {
    const { sender_id, responder_id, status } = updateFriendDto;
    try {
      const friendRequest = await this.prismaService.friends.findFirst({
        where: {
          user_id1: sender_id,
          user_id2: responder_id,
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

  async remove(fRequestDto: CreateFriendDto) {
    const { sender_id, responder_id } = fRequestDto;
    try {
      const friendRequest = await this.prismaService.friends.findFirst({
        where: {
          user_id1: sender_id,
          user_id2: responder_id,
        },
      });

      if (!friendRequest) {
        throw new NotFoundException('Friend request not found');
      }

      await this.prismaService.friends.delete({
        where: {
          user_id1_user_id2: {
            user_id1: friendRequest.user_id1,
            user_id2: friendRequest.user_id2,
          },
        },
      });

      return { message: 'Friend request deleted' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}
