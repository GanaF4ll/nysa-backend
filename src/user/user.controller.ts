import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Crée un utilisateur',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Récupère tous les utilisateurs',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':auth_id')
  @ApiOperation({
    summary: 'Récupère un utilisateur',
  })
  findOne(@Param('auth_id') auth_id: string) {
    return this.userService.findOne(auth_id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  @ApiOperation({
    summary:
      "Met à jour un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const auth_id = request['user'].id;
    return this.userService.update(auth_id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/deactivate')
  @ApiOperation({
    summary:
      "Désactive un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  deactivate(@Req() request: Request) {
    const auth_id = request['user'].id;
    return this.userService.deactivate(auth_id);
  }

  @UseGuards(AuthGuard)
  @Delete(':auth_id')
  @ApiOperation({
    summary:
      "Supprime un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  remove(@Req() request: Request) {
    const auth_id = request['user'].id;
    return this.userService.remove(auth_id);
  }
}
