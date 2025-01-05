import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
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
    this.logger.log('Entering googleCallback');
    this.logger.log(`Request object: ${JSON.stringify(req.user)}`);

    try {
      if (!req.user || !req.user.id) {
        this.logger.error('No user found in request');
        throw new NotFoundException('User not found in request');
      }

      const response = await this.authService.googleLogin(req.user.id);
      this.logger.log(
        `Login successful, redirecting with token: ${response.access_token}`,
      );
      return res.redirect(
        `http://localhost:3000?token=${response.access_token}`,
      );
    } catch (error) {
      this.logger.error(`Error in googleCallback: ${error.message}`);
      throw error;
    }
  }
}
