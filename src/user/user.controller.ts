import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  @ApiOperation({
    summary: 'Récupère tous les utilisateurs',
  })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son id',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get('/')
  @ApiOperation({
    summary: 'Récupère un utilisateur grâce à son email',
  })
  async findOneByEmail(@Body('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @UseGuards(AuthGuard)
  @Patch('/update')
  @ApiOperation({
    summary:
      "Met à jour un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const id = request['user'].id;
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/deactivate')
  @ApiOperation({
    summary:
      "Désactive un utilisateur, seul l'utilisateur authentifié peut le faire",
  })
  deactivate(@Req() request: Request) {
    const id = request['user'].id;
    return this.userService.deactivate(id);
  }

  @UseGuards(AuthGuard)
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
