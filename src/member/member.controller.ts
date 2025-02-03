import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Post('members/join/:event_id')
  async joinEvent(
    @Req() request: Request,
    @Param('event_id') event_id: string,
  ) {
    const user_id = request['user'].id;
    return this.memberService.addMember(event_id, user_id);
  }

  @Get('/:event_id')
  async getMembers(@Param('event_id') event_id: string) {
    return this.memberService.getMembers(event_id);
  }

  @Patch('/leave/:event_id')
  async leaveEvent(
    @Param('event_id') event_id: string,
    @Req() request: Request,
  ) {
    const user_id = request['user'].id;
    return this.memberService.leaveEvent(user_id, event_id);
  }

  @Patch('/kick/:event_id')
  async kickMember(
    @Param('event_id') event_id: string,
    @Req() request: Request,
    @Body('member_id') member_id: string,
  ) {
    const user_id = request['user'].id;
    return this.memberService.kickMember(user_id, event_id, member_id);
  }
}
