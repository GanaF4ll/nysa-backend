import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';
import { InvitationService } from './invitation.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post('add-member/')
  @ApiOperation({
    summary: "Ajouter un membre à l'événement",
  })
  async addMember(
    @Body() createMemberDto: CreateMemberDto,
    @Req() request: Request,
  ) {
    const inviter_id = request['user'].id;
    return this.invitationService.inviteMember(inviter_id, createMemberDto);
  }

  @Get('/my-invitations')
  @ApiOperation({
    summary: 'Récupérer mes invitations',
  })
  async getMyInvitations(@Req() request: Request) {
    const user_id = request['user'].id;

    return this.invitationService.getMyInvitations(user_id);
  }

  // TODO: route qui appelle acceptInvitation & addMember
  @Patch('/accept/:invitation_id')
  @ApiOperation({
    summary: 'Accepter une invitation',
  })
  async acceptInvitation(
    @Param('invitation_id') invitation_id: string,
    @Req() request: Request,
  ) {
    const user_id = request['user'].id;
    return this.invitationService.acceptInvitation(user_id, invitation_id);
  }
}
