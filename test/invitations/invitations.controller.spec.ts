import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsController } from 'src/invitations/invitations.controller';
import { InvitationsService } from 'src/invitations/invitations.service';

describe('InvitationsController', () => {
  let controller: InvitationsController;
  let service: InvitationsService;

  const mockInvitationsService = {
    inviteMember: jest.fn(),
    getMyInvitations: jest.fn(),
    acceptInvitation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationsController],
      providers: [
        {
          provide: InvitationsService,
          useValue: mockInvitationsService,
        },
      ],
    }).compile();

    controller = module.get<InvitationsController>(InvitationsController);
    module.get<InvitationsService>(InvitationsService);
  });

  describe('addMember', () => {
    it('should invite a member', async () => {
      const createMemberDto = {
        event_id: 'event-1',
        member_id: 'user-2',
      };

      const mockRequest = {
        user: { id: 'user-1' },
      };

      mockInvitationsService.inviteMember.mockResolvedValue({
        message: 'User has been invited to the event',
      });

      const result = await controller.addMember(createMemberDto, mockRequest as any);

      expect(result.message).toBe('User has been invited to the event');
      expect(mockInvitationsService.inviteMember).toHaveBeenCalledWith('user-1', createMemberDto);
    });
  });

  describe('getMyInvitations', () => {
    it('should get user invitations', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
      };

      mockInvitationsService.getMyInvitations.mockResolvedValue({
        data: [{ id: 'inv-1' }],
      });

      const result = await controller.getMyInvitations(mockRequest as any);

      expect(result.data).toBeDefined();
      expect(mockInvitationsService.getMyInvitations).toHaveBeenCalledWith('user-1');
    });
  });

  describe('acceptInvitation', () => {
    it('should accept an invitation', async () => {
      const invitationId = 'inv-1';
      const mockRequest = {
        user: { id: 'user-1' },
      };

      mockInvitationsService.acceptInvitation.mockResolvedValue({
        message: 'Invitation accepted',
      });

      const result = await controller.acceptInvitation(invitationId, mockRequest as any);

      expect(result.message).toBe('Invitation accepted');
      expect(mockInvitationsService.acceptInvitation).toHaveBeenCalledWith('user-1', invitationId);
    });
  });
});
