import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from 'src/conversations/conversations.service';
import { PrismaService } from 'src/db/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    users: {
      findUnique: jest.fn(),
    },
    conversations: {
      create: jest.fn(),
    },
    conversation_members: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUserId = 'user-1';
    const mockCreateDto = {
      name: 'Test Conversation',
      users: ['user-1', 'user-2'],
    };

    it('should create a private conversation successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce({
        id: 'user-1',
      });
      mockPrismaService.conversations.create.mockResolvedValueOnce({
        id: 'conv-1',
        name: 'Test Conversation',
        is_private: true,
      });
      mockPrismaService.users.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-2' });
      mockPrismaService.conversation_members.create.mockResolvedValue({});

      const result = await service.create(mockUserId, mockCreateDto);

      expect(result).toBe('Conversation created');
      expect(mockPrismaService.conversations.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Conversation',
          is_private: true,
        },
      });
    });

    it('should create a group conversation when more than 2 users', async () => {
      const groupDto = {
        name: 'Group Chat',
        users: ['user-1', 'user-2', 'user-3'],
      };

      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.conversations.create.mockResolvedValueOnce({
        id: 'conv-1',
        name: 'Group Chat',
        is_private: false,
      });

      await service.create(mockUserId, groupDto);

      expect(mockPrismaService.conversations.create).toHaveBeenCalledWith({
        data: {
          name: 'Group Chat',
          is_private: false,
        },
      });
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidDto = { name: 'Test', users: null };
      await expect(service.create(mockUserId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for null dto', async () => {
      await expect(service.create(mockUserId, null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for missing users array', async () => {
      const invalidDto = { name: 'Test' };
      await expect(
        service.create(mockUserId, invalidDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when admin user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(mockUserId, mockCreateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
