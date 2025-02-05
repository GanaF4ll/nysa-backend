import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Invitation_status } from '@prisma/client';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  create(@Body() body: { user_id: string }, @Req() request: Request) {
    const user_id1 = request['user'].id;

    const createFriendDto: CreateFriendDto = {
      user_id1,
      user_id2: body.user_id,
    };

    return this.friendsService.create(createFriendDto);
  }

  @Get('/my-invitations/')
  findAll(@Req() request: Request) {
    const id = request['user'].id;
    return this.friendsService.findAllMyInvitations(id);
  }

  @Get('/my-friends/')
  findMyFriends(@Req() request: Request) {
    const id = request['user'].id;
    return this.friendsService.findAllFriends(id);
  }

  @Get('/get/:id')
  findAllFriends(@Param() id: string) {
    return this.friendsService.findAllFriends(id);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.friendsService.findOne(+id);
  }

  @Patch('/accept')
  accept(@Req() request: Request, @Body() body: { user_id: string }) {
    const user_id1 = request['user'].id;

    const updateFriendDto: UpdateFriendDto = {
      user_id1,
      user_id2: body.user_id,
      status: Invitation_status.ACCEPTED,
    };
    console.log(updateFriendDto);
    return this.friendsService.update(updateFriendDto);
  }

  @Patch('/decline')
  decline(@Req() request: Request, @Body() body: { user_id: string }) {
    const user_id1 = request['user'].id;

    const updateFriendDto: UpdateFriendDto = {
      user_id1,
      user_id2: body.user_id,
      status: Invitation_status.REFUSED,
    };

    return this.friendsService.update(updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(+id);
  }
}
