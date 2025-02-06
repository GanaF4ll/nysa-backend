import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Post,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/google')
  @ApiOperation({
    summary: 'Crée un utilisateur avec un compte Google',
  })
  createGoogleUser(@Body() createGoogleUserDto: CreateGoogleUserDto) {
    return this.usersService.createGoogleUser(createGoogleUserDto);
  }

  @Get('/all')
  @ApiOperation({
    summary: 'Récupère tous les utilisateurs',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son id',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('/')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son token',
  })
  findMe(@Req() request: Request) {
    const id = request['user'].id;
    return this.usersService.findOne(id);
  }

  @Get('/email')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son email',
  })
  async findOneByEmail(@Body('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Patch('/update')
  @ApiOperation({
    summary:
      "Met à jour un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const id = request['user'].id;
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('/update-password')
  @ApiOperation({
    summary:
      "Met à jour le mot de passe d'un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  updatePassword(
    @Req() request: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const id = request['user'].id;
    return this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Patch('/deactivate')
  @ApiOperation({
    summary:
      "Désactive un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  deactivate(@Req() request: Request) {
    const id = request['user'].id;
    return this.usersService.deactivate(id);
  }

  @Delete('/delete')
  @ApiOperation({
    summary:
      "Supprime un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  remove(@Req() request: Request) {
    const id = request['user'].id;
    return this.usersService.remove(id);
  }
}
