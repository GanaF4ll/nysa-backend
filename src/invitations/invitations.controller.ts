import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateMemberDto } from 'src/members/dto/create-member.dto';
import { InvitationsService } from './invitations.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('add-member/')
  @ApiOperation({
    summary: "Ajouter un membre à l'événement",
  })
  async addMember(
    @Body() createMemberDto: CreateMemberDto,
    @Req() request: Request,
  ) {
    const inviter_id = request['user'].id;
    return this.invitationsService.inviteMember(inviter_id, createMemberDto);
  }

  @Get('/my-invitations')
  @ApiOperation({
    summary: 'Récupérer mes invitations',
  })
  async getMyInvitations(@Req() request: Request) {
    const user_id = request['user'].id;

    return this.invitationsService.getMyInvitations(user_id);
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
    return this.invitationsService.acceptInvitation(user_id, invitation_id);
  }
}
