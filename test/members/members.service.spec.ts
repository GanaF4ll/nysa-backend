import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from 'src/members/members.service';
import { PrismaService } from 'src/db/prisma.service';
import { Member_status } from '@prisma/client';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('MembersService', () => {
  let service: MembersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    events: {
      findUnique: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    event_members: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addMember', () => {
    const createMemberDto = {
      event_id: 'event-1',
      member_id: 'user-1',
    };

    it('should add a member to an event successfully', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue({ id: 'event-1' });
      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.event_members.findFirst.mockResolvedValue(null);
      mockPrismaService.event_members.create.mockResolvedValue({
        user_id: 'user-1',
        event_id: 'event-1',
        status: Member_status.CONFIRMED,
      });

      const result = await service.addMember(createMemberDto);

      expect(result.message).toBe('User has been added to the event');
      expect(result.data.status).toBe(Member_status.CONFIRMED);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue(null);

      await expect(service.addMember(createMemberDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when user is already a member', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue({ id: 'event-1' });
      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.event_members.findFirst.mockResolvedValue({
        status: Member_status.CONFIRMED,
      });

      await expect(service.addMember(createMemberDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getMembers', () => {
    it('should get members of an event successfully', async () => {
      const event_id = 'event-1';
      const mockMembers = [
        { user_id: 'user-1', event_id, status: Member_status.CONFIRMED },
        { user_id: 'user-2', event_id, status: Member_status.CONFIRMED },
      ];

      mockPrismaService.events.findUnique.mockResolvedValue({ id: event_id });
      mockPrismaService.event_members.findMany.mockResolvedValue(mockMembers);

      const result = await service.getMembers(event_id);

      expect(result.members).toEqual(mockMembers);
      expect(result.memberCount).toBe(2);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue(null);

      await expect(service.getMembers('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('leaveEvent', () => {
    const memberDto = {
      event_id: 'event-1',
      member_id: 'user-1',
    };

    it('should allow member to leave event successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.events.findUnique.mockResolvedValue({
        id: 'event-1',
        title: 'Test Event',
      });
      mockPrismaService.event_members.findFirst.mockResolvedValue({
        event_id: 'event-1',
        user_id: 'user-1',
        status: Member_status.CONFIRMED,
      });

      const result = await service.leaveEvent(memberDto);

      expect(result.message).toContain('has left the event');
      expect(mockPrismaService.event_members.update).toHaveBeenCalled();
    });
  });

  describe('kickMember', () => {
    const memberDto = {
      event_id: 'event-1',
      member_id: 'user-2',
    };

    it('should allow creator to kick member successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.events.findUnique.mockResolvedValue({
        id: 'event-1',
        creator_id: 'user-1',
      });
      mockPrismaService.event_members.findFirst.mockResolvedValue({
        event_id: 'event-1',
        user_id: 'user-2',
        status: Member_status.CONFIRMED,
      });

      const result = await service.kickMember('user-1', memberDto);

      expect(result.message).toBe('User has been kicked from the event');
      expect(mockPrismaService.event_members.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when non-creator tries to kick', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue({ id: 'user-3' });
      mockPrismaService.events.findUnique.mockResolvedValue({
        id: 'event-1',
        creator_id: 'user-1',
      });
      mockPrismaService.event_members.findFirst.mockResolvedValue({
        event_id: 'event-1',
        user_id: 'user-2',
        status: Member_status.CONFIRMED,
      });

      await expect(service.kickMember('user-3', memberDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
