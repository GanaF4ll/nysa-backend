import { create } from 'domain';
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Public } from './decorators/public.decorator';
import { VerifyMailDto } from './dto/verify-mail.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User_type, Sex } from '@prisma/client';
import { CreateImageDto } from 'src/event/image/dto/create-image.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateOrganisationDto } from 'src/user/dto/create-organisation.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Créer un compte utilisateur ou organisation' })
  @ApiBody({ type: RegisterUserDto })
  async register(
    @Body() registerDto: RegisterUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const imageName = Date.now() + file.originalname;

    const createImageDto: CreateImageDto = {
      name: imageName,
      file: file.buffer,
    };

    return this.authService.register(registerDto, createImageDto);
  }

  @Public()
  @Post('/login')
  @ApiOperation({
    summary: "Permet à l'utilisateur de se connecter",
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-mail')
  @ApiOperation({
    summary: "Permet de vérifier l'adresse mail, route non protégée",
  })
  async verifyMail(@Body() verifyMailDto: VerifyMailDto) {
    return this.authService.verifyEmail(verifyMailDto);
  }

  @Get('verify')
  @ApiOperation({
    summary: 'Vérifie la validité du token & du compte user',
  })
  async verifyToken(@Req() request: Request) {
    const id = request['user'].id;

    return this.authService.verifyToken(id);
  }

  // **************************/
  // ** GOOGLE AUTHENTICATION *
  // **************************/

  @Public() // ? décorateur @Public() pour ignorer le middleware d'authentification
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  @ApiOperation({
    summary: "Permet à l'utilisateur de se connecter avec Google",
  })
  async googleLogin() {
    console.log(process.env.GOOGLE_CLIENT_SECRET);
  }
  @Public() // ? décorateur @Public() pour ignorer le middleware d'authentification
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    try {
      if (!req.user || !req.user.id) {
        throw new NotFoundException('User not found in request');
      }

      const response = await this.authService.googleLogin(req.user.id);
      // !! changerS l'addresse de redirection pour le front
      return res.redirect(
        `http://localhost:3000?token=${response.access_token}`,
      );
    } catch (error) {
      throw error;
    }
  }
}
