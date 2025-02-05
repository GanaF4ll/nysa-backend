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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendsService.update(+id, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(+id);
  }
}
