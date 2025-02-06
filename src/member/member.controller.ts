import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
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

    return this.memberService.addMember(createMemberDto);
  }

  @Get('/get/:event_id')
  @ApiOperation({
    summary: "Récupérer les membres d'un événement",
  })
  async getMembers(@Param('event_id') event_id: string) {
    return this.memberService.getMembers(event_id);
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

    return this.memberService.leaveEvent(memberDto);
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
    return this.memberService.kickMember(user_id, memberDto);
  }
}
