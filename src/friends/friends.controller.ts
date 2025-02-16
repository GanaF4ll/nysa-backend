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
import { ApiOperation } from '@nestjs/swagger';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  @ApiOperation({
    summary: 'Ajouter un ami',
  })
  create(@Body() body: { user_id: string }, @Req() request: Request) {
    const sender_id = request['user'].id;

    const createFriendDto: CreateFriendDto = {
      sender_id,
      responder_id: body.user_id,
    };

    return this.friendsService.create(createFriendDto);
  }

  @Get('/my-invitations/')
  @ApiOperation({
    summary: "Récupérer mes invitations d'amis",
  })
  findAll(@Req() request: Request) {
    const id = request['user'].id;
    return this.friendsService.findAllMyInvitations(id);
  }

  @Get('/my-friends/')
  @ApiOperation({
    summary: 'Récupérer mes amis',
  })
  findMyFriends(@Req() request: Request) {
    const id = request['user'].id;
    return this.friendsService.findAllFriends(id);
  }

  @Get('/get/:id')
  @ApiOperation({
    summary: "Récupérer les amis d'un utilisateur",
  })
  findAllFriends(@Param() id: string) {
    return this.friendsService.findAllFriends(id);
  }

  @Patch('/accept')
  @ApiOperation({
    summary: "Accepter une demande d'ami",
  })
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
  @ApiOperation({
    summary: "Refuser une demande d'ami",
  })
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
  @ApiOperation({
    summary: "Annuler une demande d'ami",
  })
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
