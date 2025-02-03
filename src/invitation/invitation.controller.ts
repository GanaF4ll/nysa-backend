import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';
import { InvitationService } from './invitation.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('add-member/')
  async addMember(
    @Body() createMemberDto: CreateMemberDto,
    @Req() request: Request,
  ) {
    const inviter_id = request['user'].id;
    return this.invitationService.inviteMember(inviter_id, createMemberDto);
  }

  @Get('/my-invitations')
  async getMyInvitations(@Req() request: Request) {
    const user_id = request['user'].id;

    return this.invitationService.getMyInvitations(user_id);
  }

  // TODO: route qui appelle acceptInvitation & addMember
  @Patch('/accept/:invitation_id')
  async acceptInvitation(
    @Param('invitation_id') invitation_id: string,
    @Req() request: Request,
  ) {
    const user_id = request['user'].id;
    return this.invitationService.acceptInvitation(user_id, invitation_id);
  }
}
