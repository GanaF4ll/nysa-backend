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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':auth_id')
  findOne(@Param('auth_id') auth_id: string) {
    return this.userService.findOne(auth_id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Req() request: Request, @Body() updateUserDto: UpdateUserDto) {
    const auth_id = request['user'].id;
    return this.userService.update(auth_id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Patch('/deactivate')
  deactivate(@Req() request: Request) {
    const auth_id = request['user'].id;
    return this.userService.deactivate(auth_id);
  }

  // @UseGuards(AuthGuard)
  @Delete(':auth_id')
  remove(@Req() request: Request) {
    const auth_id = request['user'].id;
    return this.userService.remove(auth_id);
  }
}
