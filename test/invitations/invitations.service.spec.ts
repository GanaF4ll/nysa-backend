import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from 'src/invitations/invitations.service';
import { PrismaService } from 'src/db/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Invitation_status } from '@prisma/client';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    events: {
      findUnique: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
    },
    event_members: {
      findMany: jest.fn(),
    },
    event_Invitations: {
      findFirst: jest.fn(),
      findMany: jest.fn(), // Ajout de findMany
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('inviteMember', () => {
    const inviterId = 'inviter-1';
    const createMemberDto = {
      event_id: 'event-1',
      member_id: 'user-2',
    };

    it('should create invitation successfully for public event', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue({
        id: 'event-1',
        visibility: 'PUBLIC',
        max_participants: 10,
        title: 'Test Event',
      });
      mockPrismaService.event_members.findMany.mockResolvedValue([]);
      mockPrismaService.users.findUnique
        .mockResolvedValueOnce({ id: 'inviter-1' })
        .mockResolvedValueOnce({ id: 'user-2', firstname: 'John' });
      mockPrismaService.event_Invitations.findFirst.mockResolvedValue(null);
      mockPrismaService.event_Invitations.create.mockResolvedValue({
        id: 'inv-1',
        status: Invitation_status.PENDING,
      });

      const result = await service.inviteMember(inviterId, createMemberDto);

      expect(result.message).toContain('has been invited to the event');
    });

    it('should throw BadRequestException when event is full', async () => {
      mockPrismaService.events.findUnique.mockResolvedValue({
        id: 'event-1',
        max_participants: 2,
      });
      mockPrismaService.event_members.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await expect(service.inviteMember(inviterId, createMemberDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMyInvitations', () => {
    it('should return user invitations', async () => {
      const userId = 'user-1';
      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.event_Invitations.findMany.mockResolvedValue([
        {
          id: 'inv-1',
          event_id: 'event-1',
          status: Invitation_status.PENDING,
          inviter_id: 'inviter-1',
        },
      ]);

      const result = await service.getMyInvitations(userId);

      expect(result.data).toHaveLength(1);
      expect(mockPrismaService.event_Invitations.findMany).toHaveBeenCalledWith({
        where: { user_id: userId, status: Invitation_status.PENDING },
        select: { id: true, event_id: true, status: true, inviter_id: true },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 'non-existent';
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.getMyInvitations(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptInvitation', () => {
    it('should accept invitation successfully', async () => {
      const userId = 'user-1';
      const invitationId = 'inv-1';

      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.event_Invitations.findUnique.mockResolvedValue({
        id: invitationId,
        user_id: userId,
      });
      mockPrismaService.event_Invitations.update.mockResolvedValue({
        id: invitationId,
        status: Invitation_status.ACCEPTED,
      });

      const result = await service.acceptInvitation(userId, invitationId);

      expect(result.message).toBe('Invitation accepted');
      expect(mockPrismaService.event_Invitations.update).toHaveBeenCalledWith({
        where: { id: invitationId },
        data: { status: Invitation_status.ACCEPTED },
      });
    });

    it('should throw NotFoundException when invitation not found', async () => {
      const userId = 'user-1';
      const invitationId = 'non-existent';

      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.event_Invitations.findUnique.mockResolvedValue(null);

      await expect(service.acceptInvitation(userId, invitationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user is not the invitation owner', async () => {
      const userId = 'user-1';
      const invitationId = 'inv-1';

      mockPrismaService.users.findUnique.mockResolvedValue({ id: userId });
      mockPrismaService.event_Invitations.findUnique.mockResolvedValue({
        id: invitationId,
        user_id: 'other-user',
      });

      await expect(service.acceptInvitation(userId, invitationId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
