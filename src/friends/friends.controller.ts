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
    const sender_id = request['user'].id;

    const createFriendDto: CreateFriendDto = {
      sender_id,
      responder_id: body.user_id,
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

  @Patch('/accept')
  accept(@Req() request: Request, @Body() body: { user_id: string }) {
    const responder_id = request['user'].id;
    // * met l'ID du user en responder pour récupérer les demandes qui lui sont adressées
    // * sans celles qu'il a envoyées
    const updateFriendDto: UpdateFriendDto = {
      sender_id: body.user_id,
      responder_id,
      status: Invitation_status.ACCEPTED,
    };
    console.log(updateFriendDto);
    return this.friendsService.update(updateFriendDto);
  }

  @Patch('/decline')
  decline(@Req() request: Request, @Body() body: { user_id: string }) {
    const responder_id = request['user'].id;

    const updateFriendDto: UpdateFriendDto = {
      sender_id: body.user_id,
      responder_id,
      status: Invitation_status.ACCEPTED,
    };

    return this.friendsService.update(updateFriendDto);
  }

  @Delete('/cancel')
  remove(@Req() request: Request, @Body() body: { user_id: string }) {
    const sender_id = request['user'].id;
    // * met l'ID du user en sender pour qu'il ne puisse annuler
    // * qu'une demande qu'il a envoyée
    const fRequestDto: CreateFriendDto = {
      sender_id,
      responder_id: body.user_id,
    };
    return this.friendsService.remove(fRequestDto);
  }
}
