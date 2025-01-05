import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { cpSync } from 'fs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Créer un compte utilisateur ou organisation' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @ApiOperation({
    summary: "Permet à l'utilisateur de se connecter",
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  @ApiOperation({
    summary: 'Vérifie la validité du token & du compte user',
  })
  async verifyToken(@Req() request: Request) {
    const verifyTokenDto = {
      id: request['user'].id,
      email: request['user'].email,
    };
    return this.authService.verifyToken(verifyTokenDto);
  }

  // **************************/
  // ** GOOGLE AUTHENTICATION *
  // **************************/

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({
    summary: "Permet à l'utilisateur de se connecter avec Google",
  })
  async googleLogin() {
    console.log(process.env.GOOGLE_CLIENT_SECRET);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    try {
      if (!req.user || !req.user.id) {
        throw new NotFoundException('User not found in request');
      }

      const response = await this.authService.googleLogin(req.user.id);
      // !! changer l'addresse de redirection pour le front
      return res.redirect(
        `http://localhost:3000?token=${response.access_token}`,
      );
    } catch (error) {
      throw error;
    }
  }
}
