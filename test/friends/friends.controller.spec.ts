import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from 'src/friends/friends.controller';
import { FriendsService } from 'src/friends/friends.service';
import { Invitation_status } from '@prisma/client';

describe('FriendsController', () => {
  let controller: FriendsController;
  let service: FriendsService;

  const mockFriendsService = {
    create: jest.fn(),
    findAllMyInvitations: jest.fn(),
    findAllFriends: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FriendsService,
          useValue: mockFriendsService,
        },
      ],
    }).compile();

    controller = module.get<FriendsController>(FriendsController);
    service = module.get<FriendsService>(FriendsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a friend request', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const mockBody = { user_id: 'user-2' };

      mockFriendsService.create.mockResolvedValue({
        message: 'Friend request sent',
      });

      const result = await controller.create(mockBody, mockRequest as any);

      expect(result.message).toBe('Friend request sent');
      expect(mockFriendsService.create).toHaveBeenCalledWith({
        sender_id: 'user-1',
        responder_id: 'user-2',
      });
    });
  });

  describe('findAll', () => {
    it('should return all invitations', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };

      mockFriendsService.findAllMyInvitations.mockResolvedValue({
        data: [{ id: 'invitation-1' }],
      });

      const result = await controller.findAll(mockRequest as any);

      expect(result.data).toBeDefined();
      expect(mockFriendsService.findAllMyInvitations).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('accept', () => {
    it('should accept a friend request', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const mockBody = { user_id: 'user-2' };

      mockFriendsService.update.mockResolvedValue({
        message: 'Friend request accepted',
      });

      const result = await controller.accept(mockRequest as any, mockBody);

      expect(mockFriendsService.update).toHaveBeenCalledWith({
        sender_id: 'user-2',
        responder_id: 'user-1',
        status: Invitation_status.ACCEPTED,
      });
    });
  });

  describe('decline', () => {
    it('should decline a friend request', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const mockBody = { user_id: 'user-2' };

      mockFriendsService.update.mockResolvedValue({
        message: 'Friend request declined',
      });

      await controller.decline(mockRequest as any, mockBody);

      expect(mockFriendsService.update).toHaveBeenCalledWith({
        sender_id: 'user-2',
        responder_id: 'user-1',
        status: Invitation_status.ACCEPTED,
      });
    });
  });

  describe('remove', () => {
    it('should cancel a friend request', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const mockBody = { user_id: 'user-2' };

      mockFriendsService.remove.mockResolvedValue({
        message: 'Friend request deleted',
      });

      const result = await controller.remove(mockRequest as any, mockBody);

      expect(result.message).toBe('Friend request deleted');
      expect(mockFriendsService.remove).toHaveBeenCalledWith({
        sender_id: 'user-1',
        responder_id: 'user-2',
      });
    });
  });
});
