import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un compte utilisateur ou organisation' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }
  // @Post('/register')
  // @ApiOperation({
  //   summary:
  //     "Crée une ressource Auth avec laquelle l'utilisateur pourra se connecter",
  // })
  // register(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.register(createAuthDto);
  // }
  // @Post('/login')
  // @ApiOperation({
  //   summary: "Permet à l'utilisateur de se connecter",
  // })
  // login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }
  // @Get()
  // @ApiOperation({
  //   summary: 'Retourne toutes les ressources Auth',
  // })
  // findAll() {
  //   return this.authService.findAll();
  // }
  // @Get(':id')
  // @ApiOperation({
  //   summary: 'Retourne une ressource Auth',
  // })
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(id);
  // }
  // @UseGuards(AuthGuard)
  // @Patch(':id')
  // @ApiOperation({
  //   summary: "Met à jour une ressource Auth, nécessite d'être connecté",
  // })
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(id, updateAuthDto);
  // }
  // @Delete(':id')
  // @ApiOperation({
  //   summary: "Supprime une ressource Auth, nécessite d'être connecté",
  // })
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(id);
  // }
}
