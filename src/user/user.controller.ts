import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { CreateGoogleUserDto } from './dto/create-google-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/google')
  createGoogleUser(@Body() createGoogleUserDto: CreateGoogleUserDto) {
    return this.userService.createGoogleUser(createGoogleUserDto);
  }

  @Get('/all')
  @ApiOperation({
    summary: 'Récupère tous les utilisateurs',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son id',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('/')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son token',
  })
  findMe(@Req() request: Request) {
    const id = request['user'].id;
    return this.userService.findOne(id);
  }

  @Get('/email')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son email',
  })
  async findOneByEmail(@Body('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Patch('/update')
  @ApiOperation({
    summary:
      "Met à jour un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const id = request['user'].id;
    return this.userService.update(id, updateUserDto);
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
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Patch('/deactivate')
  @ApiOperation({
    summary:
      "Désactive un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  deactivate(@Req() request: Request) {
    const id = request['user'].id;
    return this.userService.deactivate(id);
  }

  @Delete('/delete')
  @ApiOperation({
    summary:
      "Supprime un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  remove(@Req() request: Request) {
    const id = request['user'].id;
    return this.userService.remove(id);
  }
}
