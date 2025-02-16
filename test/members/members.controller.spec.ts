import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from 'src/members/members.controller';
import { MembersService } from 'src/members/members.service';
import { Member_status } from '@prisma/client';

describe('MembersController', () => {
  let controller: MembersController;
  let membersService: MembersService;

  const mockMembersService = {
    addMember: jest.fn(),
    getMembers: jest.fn(),
    leaveEvent: jest.fn(),
    kickMember: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [
        {
          provide: MembersService,
          useValue: mockMembersService,
        },
      ],
    }).compile();

    controller = module.get<MembersController>(MembersController);
    membersService = module.get<MembersService>(MembersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('joinEvent', () => {
    it('should join an event successfully', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };

      const mockBody = { event_id: 'event-1' };

      mockMembersService.addMember.mockResolvedValue({
        message: 'User has been added to the event',
        data: {
          user_id: 'user-1',
          event_id: 'event-1',
          status: Member_status.CONFIRMED,
        },
      });

      const result = await controller.joinEvent(mockRequest as any, mockBody);

      expect(result.message).toBe('User has been added to the event');
      expect(mockMembersService.addMember).toHaveBeenCalledWith({
        event_id: 'event-1',
        member_id: 'user-1',
      });
    });
  });

  describe('getMembers', () => {
    it('should get members of an event', async () => {
      const event_id = 'event-1';
      const mockMembers = {
        members: [
          { user_id: 'user-1', event_id, status: Member_status.CONFIRMED },
          { user_id: 'user-2', event_id, status: Member_status.CONFIRMED },
        ],
        memberCount: 2,
      };

      mockMembersService.getMembers.mockResolvedValue(mockMembers);

      const result = await controller.getMembers(event_id);

      expect(result).toEqual(mockMembers);
      expect(mockMembersService.getMembers).toHaveBeenCalledWith(event_id);
    });
  });

  describe('leaveEvent', () => {
    it('should leave an event successfully', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const event_id = 'event-1';

      mockMembersService.leaveEvent.mockResolvedValue({
        message: 'User user-1 has left the event Test Event',
      });

      const result = await controller.leaveEvent(event_id, mockRequest as any);

      expect(result.message).toContain('has left the event');
      expect(mockMembersService.leaveEvent).toHaveBeenCalledWith({
        event_id,
        member_id: 'user-1',
      });
    });
  });

  describe('kickMember', () => {
    it('should kick a member successfully', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };
      const event_id = 'event-1';
      const mockBody = { member_id: 'user-2' };

      mockMembersService.kickMember.mockResolvedValue({
        message: 'User has been kicked from the event',
      });

      const result = await controller.kickMember(
        event_id,
        mockRequest as any,
        mockBody,
      );

      expect(result.message).toBe('User has been kicked from the event');
      expect(mockMembersService.kickMember).toHaveBeenCalledWith('user-1', {
        event_id,
        member_id: 'user-2',
      });
    });
  });
});
