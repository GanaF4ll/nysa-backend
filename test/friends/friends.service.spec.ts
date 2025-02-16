import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from 'src/friends/friends.service';
import { PrismaService } from 'src/db/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Invitation_status } from '@prisma/client';
import { CreateFriendDto } from 'src/friends/dto/create-friend.dto';

describe('FriendsService', () => {
  let service: FriendsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
    },
    friends: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createFriendDto = {
      sender_id: 'user-1',
      responder_id: 'user-2',
    };

    it('should create a friend request successfully', async () => {
      mockPrismaService.users.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-2' });
      mockPrismaService.friends.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockPrismaService.friends.create.mockResolvedValue({
        user_id1: 'user-1',
        user_id2: 'user-2',
        status: Invitation_status.PENDING,
      });

      const result = await service.create(createFriendDto);

      expect(result.message).toBe('Friend request sent');
      expect(mockPrismaService.friends.create).toHaveBeenCalledWith({
        data: {
          user_id1: 'user-1',
          user_id2: 'user-2',
          status: Invitation_status.PENDING,
        },
      });
    });

    it('should accept existing request when responder already sent one', async () => {
      mockPrismaService.users.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-2' });
      mockPrismaService.friends.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          user_id1: 'user-2',
          user_id2: 'user-1',
          status: Invitation_status.PENDING,
        });
      mockPrismaService.friends.update.mockResolvedValue({
        user_id1: 'user-2',
        user_id2: 'user-1',
        status: Invitation_status.ACCEPTED,
      });

      const result = await service.create(createFriendDto);

      expect(result.message).toContain('has been accepted');
      expect(mockPrismaService.friends.update).toHaveBeenCalled();
    });

    it('should throw when users are the same', async () => {
      const sameUserDto = {
        sender_id: 'user-1',
        responder_id: 'user-1',
      };

      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(service.create(sameUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when friendship already exists', async () => {
      mockPrismaService.users.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-2' });
      mockPrismaService.friends.findFirst.mockResolvedValueOnce({
        status: Invitation_status.ACCEPTED,
      });

      await expect(service.create(createFriendDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAllMyInvitations', () => {
    it('should return pending invitations', async () => {
      const userId = 'user-1';
      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.friends.findMany.mockResolvedValue([
        {
          user_id1: 'user-2',
          user_id2: userId,
          status: Invitation_status.PENDING,
        },
      ]);

      const result = await service.findAllMyInvitations(userId);

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.friends.findMany).toHaveBeenCalledWith({
        where: {
          user_id2: userId,
          status: Invitation_status.PENDING,
        },
      });
    });
  });

  describe('findAllFriends', () => {
    it('should return all accepted friends', async () => {
      const userId = 'user-1';
      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.friends.findMany.mockResolvedValue([
        {
          user_id1: userId,
          user_id2: 'user-2',
          status: Invitation_status.ACCEPTED,
        },
      ]);

      await service.findAllFriends(userId);

      expect(mockPrismaService.friends.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ user_id1: userId }, { user_id2: userId }],
          status: Invitation_status.ACCEPTED,
        },
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      sender_id: 'user-1',
      responder_id: 'user-2',
      status: Invitation_status.ACCEPTED,
    };

    it('should update friend request status', async () => {
      mockPrismaService.friends.findFirst.mockResolvedValue({
        user_id1: 'user-1',
        user_id2: 'user-2',
        status: Invitation_status.PENDING,
      });
      mockPrismaService.friends.update.mockResolvedValue({
        status: Invitation_status.ACCEPTED,
      });

      const result = await service.update(updateDto);

      expect(result.message).toContain('Friend request updated');
    });
  });

  describe('remove', () => {
    it('should delete friend request', async () => {
      const deleteDto = {
        sender_id: 'user-1',
        responder_id: 'user-2',
      };

      mockPrismaService.friends.findFirst.mockResolvedValue({
        user_id1: 'user-1',
        user_id2: 'user-2',
      });

      const result = await service.remove(deleteDto);

      expect(result.message).toBe('Friend request deleted');
      expect(mockPrismaService.friends.delete).toHaveBeenCalled();
    });
  });
});
