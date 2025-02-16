import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}
  @Post('/join/')
  @ApiOperation({
    summary: 'Rejoindre un événement',
  })
  async joinEvent(@Req() request: Request, @Body() body: { event_id: string }) {
    const user_id = request['user'].id;

    const createMemberDto: CreateMemberDto = {
      event_id: body.event_id,
      member_id: user_id,
    };

    return this.membersService.addMember(createMemberDto);
  }

  @Get('/get/:event_id')
  @ApiOperation({
    summary: "Récupérer les membres d'un événement",
  })
  async getMembers(@Param('event_id') event_id: string) {
    return this.membersService.getMembers(event_id);
  }

  @Patch('/leave/:event_id')
  @ApiOperation({
    summary: 'Quitter un événement',
  })
  async leaveEvent(
    @Param('event_id') event_id: string,
    @Req() request: Request,
  ) {
    const user_id = request['user'].id;

    const memberDto: CreateMemberDto = {
      event_id,
      member_id: user_id,
    };

    return this.membersService.leaveEvent(memberDto);
  }

  @Patch('/kick/:event_id')
  @ApiOperation({
    summary: "Exclure un membre d'un événement",
  })
  async kickMember(
    @Param('event_id') event_id: string,
    @Req() request: Request,
    @Body() body: { member_id: string },
  ) {
    const user_id = request['user'].id;

    const memberDto: CreateMemberDto = {
      event_id,
      member_id: body.member_id,
    };
    return this.membersService.kickMember(user_id, memberDto);
  }
}
